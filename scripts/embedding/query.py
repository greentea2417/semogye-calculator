"""저장된 세모계 지식을 검색하고, 결과가 원본 파일에 실제로 존재하는지 검증한다."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import chromadb
from openai import OpenAI

REPO = Path(__file__).resolve().parents[2]
INDEX_DIR = REPO / ".knowledge-index"
MODEL = "text-embedding-3-small"

QUERIES = [
    "세모계의 계산기 제작 원칙은 무엇인가?",
    "세모계에서 SEO 페이지를 만들 때 무엇을 확인해야 하는가?",
    "수익성이 높은 계산기를 고르는 기준은 무엇인가?",
]


def main() -> int:
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    col = chromadb.PersistentClient(path=str(INDEX_DIR)).get_collection("semogye-knowledge")

    queries = sys.argv[1:] or QUERIES
    results = []
    tokens = 0

    for q in queries:
        emb = client.embeddings.create(model=MODEL, input=q)
        tokens += emb.usage.total_tokens
        hits = col.query(
            query_embeddings=[emb.data[0].embedding],
            n_results=3,
            include=["documents", "metadatas", "distances"],
        )
        rows = []
        for doc, meta, dist in zip(hits["documents"][0], hits["metadatas"][0], hits["distances"][0]):
            # grounding check: the retrieved text must literally exist in its source file
            src = (REPO / meta["source"]).read_text()
            probe = doc.strip().splitlines()[0].strip()
            rows.append(
                {
                    "source": meta["source"],
                    "heading": meta["heading"],
                    "category": meta["category"],
                    "similarity": round(1 - dist, 4),
                    "grounded": probe in src,
                    "preview": doc.strip().replace("\n", " ")[:110],
                }
            )
        results.append({"query": q, "hits": rows})

    grounded = all(h["grounded"] for r in results for h in r["hits"])
    print(
        json.dumps(
            {
                "queries": len(results),
                "all_hits_grounded_in_source": grounded,
                "query_tokens": tokens,
                "results": results,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0 if grounded else 1


if __name__ == "__main__":
    sys.exit(main())
