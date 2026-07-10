import { NextResponse } from 'next/server';
import kb from './knowledge.json';

export const runtime = 'nodejs';
export const maxDuration = 30;

const EMBED_MODEL = 'text-embedding-3-small';
const CHAT_MODEL = 'gpt-4o-mini';
const TOP_K = 4;

type KbItem = {
  id: string;
  text: string;
  source: string;
  heading: string;
  category: string;
  embedding: number[];
};

const ITEMS = (kb as { items: KbItem[] }).items;

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

async function embed(apiKey: string, input: string): Promise<{ vector: number[]; tokens: number }> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: EMBED_MODEL, input }),
  });
  if (!res.ok) throw new Error(`embedding failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return { vector: json.data[0].embedding, tokens: json.usage?.total_tokens ?? 0 };
}

async function answer(apiKey: string, question: string, context: string) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: CHAT_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            '당신은 세모계(semogye.com) 지식 도우미입니다. 아래 제공된 컨텍스트에만 근거해 한국어로 간결하게 답하세요. ' +
            '컨텍스트에 근거가 없으면 "제공된 문서에서 관련 내용을 찾지 못했습니다"라고 답하세요. 추측하지 마세요.',
        },
        { role: 'user', content: `컨텍스트:\n${context}\n\n질문: ${question}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`chat failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: 'OPENAI_API_KEY가 이 배포 환경에 설정되어 있지 않습니다.' },
        { status: 503 },
      );
    }

    const { question } = await req.json();
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ ok: false, error: 'question is required' }, { status: 400 });
    }

    const { vector, tokens: embTokens } = await embed(apiKey, question);

    const ranked = ITEMS.map((it) => ({ it, score: cosine(vector, it.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K);

    const context = ranked
      .map((r, i) => `[${i + 1}] (${r.it.source} / ${r.it.heading})\n${r.it.text}`)
      .join('\n\n');

    const chat = await answer(apiKey, question, context);

    return NextResponse.json({
      ok: true,
      answer: chat.choices?.[0]?.message?.content ?? '',
      citations: ranked.map((r) => ({
        source: r.it.source,
        heading: r.it.heading,
        similarity: Number(r.score.toFixed(4)),
      })),
      usage: {
        embedding_tokens: embTokens,
        chat_total_tokens: chat.usage?.total_tokens ?? 0,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
