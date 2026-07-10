from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import chromadb
from openai import OpenAI

REPO = Path('/home/ubuntu/work/semogye-calculator')
INDEX_DIR = REPO / '.knowledge-index'
COLLECTION = 'semogye-knowledge'
MODEL = 'text-embedding-3-small'
CHAT_MODEL = os.getenv('OPENAI_CHAT_MODEL', 'gpt-4o-mini')


def main() -> int:
    question = sys.stdin.read().strip()
    if not question:
        print(json.dumps({'ok': False, 'error': 'empty question'}, ensure_ascii=False))
        return 1

    client = OpenAI()
    emb = client.embeddings.create(model=MODEL, input=question)
    chroma = chromadb.PersistentClient(path=str(INDEX_DIR))
    col = chroma.get_collection(COLLECTION)
    hits = col.query(
        query_embeddings=[emb.data[0].embedding],
        n_results=4,
        include=['documents', 'metadatas', 'distances'],
    )

    context_blocks = []
    citations = []
    for doc, meta, dist in zip(hits['documents'][0], hits['metadatas'][0], hits['distances'][0]):
        context_blocks.append(f"[출처: {meta['source']} / {meta['heading']} / 유사도 {1-dist:.3f}]\n{doc}")
        citations.append({
            'source': meta.get('source'),
            'heading': meta.get('heading'),
            'similarity': round(1 - dist, 4),
        })

    system = (
        '당신은 세모계(semogye.com) 사이트의 RAG 챗봇입니다. '\
        '반드시 제공된 문서 컨텍스트에만 근거해 답하고, 확실하지 않으면 모른다고 말하세요. '\
        '답변은 한국어로, 짧고 실무적으로 쓰고 마지막에 출처를 2~4개 적으세요.'
    )
    prompt = (
        f"질문: {question}\n\n"
        f"컨텍스트:\n{'\n\n'.join(context_blocks)}\n\n"
        '답변 규칙: 컨텍스트 외 추측 금지, 핵심 요약 후 출처 표기.'
    )
    chat = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': prompt},
        ],
        temperature=0.2,
    )
    out = {
        'ok': True,
        'answer': chat.choices[0].message.content,
        'citations': citations,
        'usage': {
            'embedding_tokens': emb.usage.total_tokens,
            'chat_prompt_tokens': chat.usage.prompt_tokens,
            'chat_completion_tokens': chat.usage.completion_tokens,
            'chat_total_tokens': chat.usage.total_tokens,
        },
    }
    print(json.dumps(out, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
