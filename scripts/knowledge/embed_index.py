"""세모계 지식 임베딩 파이프라인.

원본 문서를 읽어 의미 단위로 나누고, text-embedding-3-small 로 임베딩해
ChromaDB 에 저장한다. 원본 파일은 읽기만 하며 절대 수정하지 않는다.

중복 방지: chunk 본문의 SHA256 을 id 로 사용한다. 이미 같은 id 가 저장돼
있으면 임베딩 API 를 호출하지 않으므로, 재실행 시 변경된 chunk 만 처리된다.

민감정보: 임베딩 직전에 다시 스캔하고, 탐지된 chunk 는 저장하지 않는다.
API 키는 환경변수에서만 읽고 어디에도 출력하지 않는다.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import chromadb
from openai import OpenAI

REPO = Path(__file__).resolve().parents[2]
INDEX_DIR = REPO / ".knowledge-index"
COLLECTION = "semogye-knowledge"
MODEL = "text-embedding-3-small"
PRICE_PER_MTOK = 0.02

SOURCES = [
    (REPO / "task.md", "계산기 발굴·제작·검수 반복 루프", "calculator-process"),
    (REPO / "REVIEW.md", "계산기 검수 기준표", "review-criteria"),
    (REPO / "README.md", "프로젝트 개요", "project-overview"),
]

# 실제 자격증명 형태만 잡는다. 문서 본문의 "secret" 같은 일반 단어는 제외.
SECRET_PATTERNS = [
    ("openai-key", re.compile(r"sk-[A-Za-z0-9_\-]{20,}")),
    ("github-pat", re.compile(r"gh[pousr]_[A-Za-z0-9]{20,}")),
    ("aws-key", re.compile(r"AKIA[0-9A-Z]{16}")),
    ("private-key", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("bearer", re.compile(r"(?i)bearer\s+[A-Za-z0-9._\-]{20,}")),
    ("assigned-secret", re.compile(r"(?i)(api[_-]?key|password|passwd|token|secret)\s*[:=]\s*['\"]?[A-Za-z0-9._\-]{16,}")),
    ("email", re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")),
    ("kr-phone", re.compile(r"01[016789][-\s]?\d{3,4}[-\s]?\d{4}")),
    ("kr-rrn", re.compile(r"\d{6}[-\s]?[1-4]\d{6}")),
]


def scan_secrets(text: str) -> list[str]:
    return [name for name, pat in SECRET_PATTERNS if pat.search(text)]


def chunk_markdown(text: str, max_chars: int = 1400) -> list[tuple[str, str]]:
    """(heading, body) 쌍으로 자른다. 헤딩 경계를 우선하고, 너무 길면 문단 단위로 쪼갠다."""
    sections: list[tuple[str, list[str]]] = [("(intro)", [])]
    for line in text.splitlines():
        if line.startswith("#"):
            sections.append((line.lstrip("# ").strip(), []))
        else:
            sections[-1][1].append(line)

    chunks: list[tuple[str, str]] = []
    for heading, lines in sections:
        body = "\n".join(lines).strip()
        if not body:
            continue
        if len(body) <= max_chars:
            chunks.append((heading, body))
            continue
        buf: list[str] = []
        size = 0
        for para in body.split("\n\n"):
            if size + len(para) > max_chars and buf:
                chunks.append((heading, "\n\n".join(buf)))
                buf, size = [], 0
            buf.append(para)
            size += len(para)
        if buf:
            chunks.append((heading, "\n\n".join(buf)))
    return chunks


def main() -> int:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print(json.dumps({"status": "failed", "error": "OPENAI_API_KEY not in environment"}))
        return 1

    now = datetime.now(timezone.utc).isoformat()
    client = OpenAI(api_key=api_key)
    chroma = chromadb.PersistentClient(path=str(INDEX_DIR))
    coll = chroma.get_or_create_collection(COLLECTION, metadata={"hnsw:space": "cosine"})

    existing = set(coll.get(include=[])["ids"])

    pending: list[dict] = []
    skipped_secret: list[dict] = []
    reused = 0

    for path, title, category in SOURCES:
        raw = path.read_text()
        for idx, (heading, body) in enumerate(chunk_markdown(raw)):
            hits = scan_secrets(body)
            if hits:
                skipped_secret.append({"source": path.name, "heading": heading, "patterns": hits})
                continue
            cid = hashlib.sha256(f"{path.name}::{body}".encode()).hexdigest()[:32]
            if cid in existing:
                reused += 1
                continue
            pending.append({
                "id": cid,
                "text": body,
                "meta": {
                    "source": path.name,
                    "title": title,
                    "category": category,
                    "heading": heading,
                    "chunk_index": idx,
                    "created_at": now,
                    "sha256": cid,
                },
            })

    embedded = 0
    failed = 0
    tokens = 0
    if pending:
        for i in range(0, len(pending), 64):
            batch = pending[i : i + 64]
            try:
                resp = client.embeddings.create(model=MODEL, input=[c["text"] for c in batch])
            except Exception as exc:  # noqa: BLE001 — batch 실패는 건수만 기록하고 계속 간다
                failed += len(batch)
                print(f"batch {i} failed: {type(exc).__name__}", file=sys.stderr)
                continue
            tokens += resp.usage.total_tokens
            coll.add(
                ids=[c["id"] for c in batch],
                documents=[c["text"] for c in batch],
                metadatas=[c["meta"] for c in batch],
                embeddings=[d.embedding for d in resp.data],
            )
            embedded += len(batch)

    print(json.dumps({
        "status": "ok" if failed == 0 else "partial",
        "model": MODEL,
        "db_path": str(INDEX_DIR),
        "collection": COLLECTION,
        "sources": [p.name for p, _, _ in SOURCES],
        "chunks_new_embedded": embedded,
        "chunks_reused_by_hash": reused,
        "chunks_failed": failed,
        "chunks_skipped_sensitive": skipped_secret,
        "total_in_collection": coll.count(),
        "tokens_used": tokens,
        "cost_usd": round(tokens / 1_000_000 * PRICE_PER_MTOK, 8),
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
