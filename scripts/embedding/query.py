"""세모계 지식 검색 + 정확성 검증.

Dense-only 검색은 짧은 한국어 체크리스트에서 어휘 중복에 쉽게 진다.
("수익성 기준" 질의가 '계산'을 반복하는 기능 검수 chunk에 밀림)
그래서 코사인 점수에 질의어-헤딩/본문 중첩 점수를 섞어 재순위한다.

검증은 두 가지를 본다.
  1. grounded : 검색된 텍스트가 원본 파일에 실제로 존재하는가
  2. recall@3 : 정답 섹션이 상위 3건에 들어오는가
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

import chromadb
from openai import OpenAI

REPO = Path(__file__).resolve().parents[2]
INDEX_DIR = REPO / ".knowledge-index"
MODEL = "text-embedding-3-small"
DENSE_W, LEX_W = 0.75, 0.25
CANDIDATES = 15

# (질의, 정답으로 인정할 섹션 heading 후보)
CASES = [
    ("세모계의 계산기 제작 원칙은 무엇인가?", ["사용 원칙", "(intro)", "목적"]),
    ("세모계에서 SEO 페이지를 만들 때 무엇을 확인해야 하는가?", ["10단계. SEO 설계", "7. SEO 검수"]),
    ("수익성이 높은 계산기를 고르는 기준은 무엇인가?", ["3. 수익성 검수", "5단계. 수익성 검사"]),
]

_WORD = re.compile(r"[가-힣A-Za-z0-9]+")


def bigrams(text: str) -> set[str]:
    """Character bigrams over word runs.

    Korean glues particles onto nouns — the query says 수익성'이' while the
    heading says 수익성 — so whole-word equality never fires. Bigrams match the
    shared stem without needing a morphological analyzer.
    """
    out: set[str] = set()
    for word in _WORD.findall(text):
        if len(word) == 1:
            out.add(word)
        for i in range(len(word) - 1):
            out.add(word[i : i + 2])
    return out


def lexical(query: str, heading: str, body: str) -> float:
    q = bigrams(query)
    if not q:
        return 0.0
    # A section title is a stronger topic signal than the same words buried in a
    # checklist bullet, so heading overlap is weighted well above body overlap.
    head_hit = len(q & bigrams(heading)) / len(q)
    body_hit = len(q & bigrams(body)) / len(q)
    return min(1.0, 1.5 * head_hit + 0.4 * body_hit)


def main() -> int:
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    col = chromadb.PersistentClient(path=str(INDEX_DIR)).get_collection("semogye-knowledge")

    results, tokens_used, recall_hits = [], 0, 0

    for query, expected in CASES:
        emb = client.embeddings.create(model=MODEL, input=query)
        tokens_used += emb.usage.total_tokens
        raw = col.query(
            query_embeddings=[emb.data[0].embedding],
            n_results=CANDIDATES,
            include=["documents", "metadatas", "distances"],
        )

        scored = []
        for doc, meta, dist in zip(raw["documents"][0], raw["metadatas"][0], raw["distances"][0]):
            cosine = 1 - dist
            lex = lexical(query, meta["heading"], doc)
            scored.append((DENSE_W * cosine + LEX_W * lex, cosine, lex, doc, meta))
        scored.sort(key=lambda r: r[0], reverse=True)

        rows = []
        for score, cosine, lex, doc, meta in scored[:3]:
            src = (REPO / meta["source"]).read_text()
            probe = doc.strip().splitlines()[0].strip()
            rows.append(
                {
                    "source": meta["source"],
                    "heading": meta["heading"],
                    "category": meta["category"],
                    "score": round(score, 4),
                    "cosine": round(cosine, 4),
                    "lexical": round(lex, 4),
                    "grounded": probe in src,
                    "preview": doc.strip().replace("\n", " ")[:100],
                }
            )

        hit = any(r["heading"] in expected for r in rows)
        recall_hits += hit
        results.append({"query": query, "expected_any_of": expected, "recall@3": hit, "hits": rows})

    grounded = all(h["grounded"] for r in results for h in r["hits"])
    passed = grounded and recall_hits == len(CASES)

    print(
        json.dumps(
            {
                "queries": len(results),
                "all_hits_grounded_in_source": grounded,
                "recall@3": f"{recall_hits}/{len(CASES)}",
                "verdict": "PASS" if passed else "FAIL",
                "query_tokens": tokens_used,
                "results": results,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
