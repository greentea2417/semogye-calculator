"""검색 검증: 질의 결과가 실제 원본 파일에 존재하는 문장인지 대조한다.

임베딩이 그럴듯한 답을 지어내지 않았다는 것을 보이기 위해, 반환된 chunk 본문이
메타데이터가 가리키는 원본 파일 안에 문자 그대로 들어 있는지 확인한다.
"""

from __future__ import annotations

import json
from pathlib import Path

import chromadb
from openai import OpenAI

REPO = Path(__file__).resolve().parents[2]
INDEX_DIR = REPO / ".knowledge-index"
MODEL = "text-embedding-3-small"

QUERIES = [
    "세모계의 계산기 제작 원칙과 공식 근거 검증 절차는?",
    "SEO 설계에서 무엇을 작성해야 하나? FAQ는 몇 개 필요한가?",
    "수익성 평가 등급 A/B/C/D 기준과 최종 선정 규칙은?",
]


def main() -> None:
    import os

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    coll = chromadb.PersistentClient(path=str(INDEX_DIR)).get_collection("semogye-knowledge")

    tokens = 0
    report = []
    for q in QUERIES:
        r = client.embeddings.create(model=MODEL, input=q)
        tokens += r.usage.total_tokens
        res = coll.query(query_embeddings=[r.data[0].embedding], n_results=3)

        hits = []
        for doc, meta, dist in zip(res["documents"][0], res["metadatas"][0], res["distances"][0]):
            original = (REPO / meta["source"]).read_text()
            hits.append({
                "source": meta["source"],
                "heading": meta["heading"],
                "category": meta["category"],
                "similarity": round(1 - dist, 4),
                "verbatim_in_original": doc in original,
                "preview": doc.splitlines()[0][:70],
            })
        report.append({"query": q, "top_hits": hits, "all_verbatim": all(h["verbatim_in_original"] for h in hits)})

    print(json.dumps({
        "queries": report,
        "all_queries_grounded": all(x["all_verbatim"] for x in report),
        "query_tokens": tokens,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
