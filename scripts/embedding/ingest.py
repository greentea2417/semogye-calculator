"""세모계 지식 임베딩 파이프라인.

원본 문서를 읽어 의미 단위로 나누고, text-embedding-3-small 로 임베딩해
ChromaDB 에 저장한다. 원본은 절대 수정하지 않는다.

중복 방지: chunk 텍스트의 SHA256 을 id 로 쓰고, 문서 단위 해시를 매니페스트에
기록해 내용이 바뀌지 않은 문서는 재임베딩하지 않는다.

민감정보: 실제 자격증명 패턴이 잡히면 해당 문서를 임베딩 대상에서 제외한다.
정책 문서에 등장하는 'secret', 'API 키' 같은 단어는 값이 아니므로 통과시킨다.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

import chromadb
from openai import OpenAI

REPO = Path(__file__).resolve().parents[2]
INDEX_DIR = REPO / ".knowledge-index"
MANIFEST = INDEX_DIR / "manifest.json"
COLLECTION = "semogye-knowledge"
MODEL = "text-embedding-3-small"
PRICE_PER_MTOK = 0.02

# Bump when the embedding recipe changes; the index is rebuilt from scratch so
# vectors produced by different recipes never coexist in one collection.
EMBED_VERSION = "v3-h3-headings"

SOURCES = [
    (REPO / "task.md", "계산기 제작 원칙", "calculator-loop"),
    (REPO / "REVIEW.md", "검수 기준", "review-criteria"),
    (REPO / "README.md", "프로젝트 개요", "project-overview"),
]

# Credential *values*, not the words describing them. A policy doc that says
# "API 키를 노출하지 말 것" must not trip this.
SECRET_PATTERNS = [
    ("openai-key", r"sk-[A-Za-z0-9_\-]{20,}"),
    ("github-pat", r"gh[pousr]_[A-Za-z0-9]{30,}"),
    ("aws-key", r"AKIA[0-9A-Z]{16}"),
    ("private-key", r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    ("bearer", r"(?i)bearer\s+[A-Za-z0-9._\-]{20,}"),
    ("assigned-secret", r"(?i)(password|passwd|secret|token|api[_-]?key)\s*[:=]\s*[\"']?[A-Za-z0-9._\-]{12,}"),
    ("email", r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}"),
    ("kr-phone", r"01[016789][-\s]?\d{3,4}[-\s]?\d{4}"),
    ("kr-rrn", r"\d{6}[-\s]?[1-4]\d{6}"),
]


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def scan_secrets(text: str) -> list[dict]:
    hits = []
    for name, pattern in SECRET_PATTERNS:
        for m in re.finditer(pattern, text):
            hits.append({"type": name, "line": text[: m.start()].count("\n") + 1})
    return hits


def chunk_markdown(text: str, max_chars: int = 1800) -> list[tuple[str, str]]:
    """Split on H2, then H3, then hard-wrap. Returns (heading, body) pairs."""
    blocks: list[tuple[str, str]] = []
    current_head = "(intro)"
    buf: list[str] = []

    def flush():
        body = "\n".join(buf).strip()
        if body:
            blocks.append((current_head, body))

    for line in text.splitlines():
        if line.startswith("## "):
            flush()
            buf.clear()
            current_head = line.lstrip("# ").strip()
        buf.append(line)
    flush()

    out: list[tuple[str, str]] = []
    for head, body in blocks:
        if len(body) <= max_chars:
            out.append((head, body))
            continue
        # Too large: split on H3. Each H3 part carries its own heading — inheriting
        # the parent H2 would label every step of a long loop with the same name,
        # which then poisons the contextual prefix built from that label.
        parts: list[tuple[str, str]] = []
        cur: list[str] = []
        cur_head = head
        for line in body.splitlines():
            if line.startswith("### "):
                if cur:
                    parts.append((cur_head, "\n".join(cur)))
                    cur = []
                cur_head = line.lstrip("# ").strip()
            cur.append(line)
        if cur:
            parts.append((cur_head, "\n".join(cur)))

        for sub_head, part in parts:
            while len(part) > max_chars:
                cut = part.rfind("\n", 0, max_chars)
                cut = cut if cut > 0 else max_chars
                out.append((sub_head, part[:cut].strip()))
                part = part[cut:]
            if part.strip():
                out.append((sub_head, part.strip()))
    return out


def contextualize(title: str, source: str, heading: str, body: str) -> str:
    """Text actually sent to the embedding model.

    A bare checklist ("- CPC가 기대되는 분야인가") carries no signal about which
    document or topic it belongs to, so a query about 수익성 loses to any chunk
    that happens to repeat the query's nouns. Restating the metadata in front of
    the body fixes that. Only metadata is added — no invented content.
    """
    return f"[문서: {title} ({source})]\n[섹션: {heading}]\n이 내용은 세모계 '{title}' 문서의 '{heading}' 항목이다.\n\n{body}"


def load_manifest() -> dict:
    if MANIFEST.exists():
        return json.loads(MANIFEST.read_text())
    return {"documents": {}, "runs": [], "embed_version": EMBED_VERSION}


def backup_index() -> str | None:
    if not INDEX_DIR.exists() or not any(INDEX_DIR.iterdir()):
        return None
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    dest = REPO / f".knowledge-index.bak.{stamp}"
    shutil.copytree(INDEX_DIR, dest)
    return str(dest)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="ignore manifest, re-embed everything")
    args = ap.parse_args()

    started = datetime.now(timezone.utc)
    report: dict = {
        "task_id": f"embed-{started:%Y%m%d-%H%M%S}",
        "started_at": started.isoformat(),
        "model": MODEL,
        "db": str(INDEX_DIR),
        "documents": [],
        "excluded": [],
        "secret_hits": [],
        "chunks_new": 0,
        "chunks_skipped": 0,
        "failures": [],
        "tokens": 0,
        "cost_usd": 0.0,
    }

    backup = backup_index()
    report["backup"] = backup

    manifest = load_manifest()
    INDEX_DIR.mkdir(parents=True, exist_ok=True)

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    chroma = chromadb.PersistentClient(path=str(INDEX_DIR))

    recipe_changed = manifest.get("embed_version") != EMBED_VERSION
    if recipe_changed or args.force:
        try:
            chroma.delete_collection(COLLECTION)
        except Exception:  # noqa: BLE001 — collection may not exist yet
            pass
        manifest = {"documents": {}, "runs": manifest.get("runs", []), "embed_version": EMBED_VERSION}
    report["embed_version"] = EMBED_VERSION
    report["rebuilt"] = recipe_changed or args.force

    col = chroma.get_or_create_collection(COLLECTION, metadata={"hnsw:space": "cosine"})

    pending: list[dict] = []

    for path, title, category in SOURCES:
        if not path.exists():
            report["failures"].append({"file": str(path), "reason": "missing"})
            continue
        text = path.read_text()
        hits = scan_secrets(text)
        if hits:
            report["excluded"].append({"file": path.name, "hits": hits})
            report["secret_hits"].extend(hits)
            continue

        doc_hash = sha256(text)
        prev = manifest["documents"].get(path.name)
        unchanged = prev and prev["hash"] == doc_hash and not args.force

        chunks = chunk_markdown(text)
        report["documents"].append(
            {
                "file": path.name,
                "title": title,
                "category": category,
                "chars": len(text),
                "chunks": len(chunks),
                "hash": doc_hash,
                "status": "unchanged" if unchanged else "embedding",
            }
        )
        if unchanged:
            report["chunks_skipped"] += len(chunks)
            continue

        for i, (heading, body) in enumerate(chunks):
            cid = sha256(f"{EMBED_VERSION}::{path.name}::{i}::{body}")
            pending.append(
                {
                    "id": cid,
                    "text": body,
                    "embed_text": contextualize(title, path.name, heading, body),
                    "meta": {
                        "source": path.name,
                        "title": title,
                        "category": category,
                        "heading": heading,
                        "chunk_index": i,
                        "doc_hash": doc_hash,
                        "created_at": started.isoformat(),
                    },
                }
            )
        manifest["documents"][path.name] = {
            "hash": doc_hash,
            "title": title,
            "category": category,
            "chunks": len(chunks),
            "embedded_at": started.isoformat(),
        }

    # id-level dedupe against what is already stored
    if pending:
        existing = set(col.get(ids=[p["id"] for p in pending])["ids"])
        deduped = [p for p in pending if p["id"] not in existing]
        report["chunks_skipped"] += len(pending) - len(deduped)
        pending = deduped

    for start in range(0, len(pending), 64):
        batch = pending[start : start + 64]
        try:
            resp = client.embeddings.create(model=MODEL, input=[b["embed_text"] for b in batch])
        except Exception as exc:  # noqa: BLE001
            report["failures"].append({"batch": start, "error": type(exc).__name__})
            continue
        report["tokens"] += resp.usage.total_tokens
        # response order is not contractual — realign by index before pairing
        vectors = [d.embedding for d in sorted(resp.data, key=lambda d: d.index)]
        col.upsert(
            ids=[b["id"] for b in batch],
            embeddings=vectors,
            documents=[b["text"] for b in batch],
            metadatas=[b["meta"] for b in batch],
        )
        report["chunks_new"] += len(batch)

    report["cost_usd"] = round(report["tokens"] / 1_000_000 * PRICE_PER_MTOK, 8)
    report["stored_total"] = col.count()
    report["finished_at"] = datetime.now(timezone.utc).isoformat()
    report["status"] = "failed" if report["failures"] else "ok"

    # Only claim the recipe version once vectors for it are actually in the index.
    # Otherwise a failed run would mark the index as up-to-date and the next run
    # would skip the rebuild it still needs.
    manifest["embed_version"] = EMBED_VERSION if report["status"] == "ok" else manifest.get("embed_version")
    manifest["runs"].append(
        {k: report[k] for k in ("task_id", "started_at", "finished_at", "status", "chunks_new", "tokens", "cost_usd")}
    )
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if report["failures"] else 0


if __name__ == "__main__":
    sys.exit(main())
