import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fallbackKnowledge from './knowledge-public.json';
import { CALCULATORS } from '../../../data/calculators';

export const runtime = 'nodejs';
export const maxDuration = 60;

const CHAT_MODEL = 'gpt-4o-mini';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSION = 1536;
const FALLBACK_TOP_K = 4;

const BLOCKED_PATTERNS = [
  /\btask\.md\b/i,
  /\bREVIEW\.md\b/i,
  /\bREADME\.md\b/i,
  /\b전체 내용을?(?:\s*보여|\s*출력|\s*공개)\b/i,
  /\b원문\b/i,
  /\bAPI\s*키\b/i,
  /\b토큰\b/i,
  /\b비밀번호\b/i,
  /\bSSH\b/i,
  /\bGitHub\s*인증/i,
  /\b내부\s*지시/i,
  /\b가족정보\b/i,
  /\b개인\s*메모\b/i,
];

type Item = {
  calculator_name: string;
  category: string;
  main_description: string;
  input_items: string;
  output_items: string;
  recommended_users: string;
  content_topics: string;
  page_path: string;
  source: string;
  similarity?: number;
};

type FallbackItem = { id: string; text: string; source: string; heading: string };

const FALLBACK_ITEMS = (fallbackKnowledge as { items: FallbackItem[] }).items;

function blocked(question: string) {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(question));
}

function buildContent(item: Item) {
  return [
    `계산기명: ${item.calculator_name}`,
    `카테고리: ${item.category}`,
    `주요 설명: ${item.main_description}`,
    `입력 항목: ${item.input_items}`,
    `제공 결과: ${item.output_items}`,
    `추천 사용자: ${item.recommended_users}`,
    `활용 가능한 콘텐츠 주제: ${item.content_topics}`,
    `페이지 경로 또는 출처: ${item.page_path}`,
  ].join('\n');
}

function fallbackScore(question: string, item: FallbackItem): number {
  const q = question.toLowerCase();
  const text = `${item.heading} ${item.text}`.toLowerCase();
  const qTokens = q.replace(/[^\u0000-\u007f가-힣\s]/g, ' ').split(/\s+/).filter((t) => t.length > 1);
  let score = 0;
  for (const token of qTokens) if (text.includes(token)) score += 1;
  return score;
}

function categoryHint(question: string) {
  if (/자영업|사장|매장|사업|프리랜서|직장|급여|월급|시급|퇴직|실업급여|연차|부가세/i.test(question)) return 'business';
  if (/건강|키|BMI|체중|다이어트/i.test(question)) return 'life';
  return null;
}

async function buildAnswer(openai: OpenAI, question: string, context: string) {
  const res = await openai.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          '당신은 세모계 계산기 추천/콘텐츠 생성 도우미입니다. 반드시 제공된 컨텍스트에 근거해 한국어로 답하세요. 계산기 추천, 비교, 콘텐츠 초안 생성, 대상별 목록 제안이 가능해야 합니다. 답변에는 사용한 계산기명과 페이지 경로를 함께 표시하되, 경로는 컨텍스트에 있는 값(예: /business/salary)을 그대로 쓰고 도메인이나 전체 URL을 임의로 만들어 붙이지 마세요. 컨텍스트에 근거가 없으면 "제공된 데이터에서 관련 내용을 찾지 못했습니다"라고 답하세요.',
      },
      { role: 'user', content: `컨텍스트:\n${context}\n\n질문: ${question}` },
    ],
  });
  return res;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const question = body?.question;
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ ok: false, error: 'question is required' }, { status: 400 });
    }

    if (blocked(question)) {
      return NextResponse.json({ ok: true, answer: '제공된 공개 데이터 범위를 벗어난 요청은 답변할 수 없습니다.', citations: [], usage: { embedding_tokens: 0, chat_total_tokens: 0 } });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

    if (supabaseUrl && supabaseServiceRoleKey && openai) {
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });
      const embedding = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: question });
      const vector = embedding.data[0]?.embedding;
      if (!vector || vector.length !== EMBEDDING_DIMENSION) {
        throw new Error(`embedding dimension mismatch: expected ${EMBEDDING_DIMENSION}`);
      }

      const { data, error } = await supabase.rpc('match_calculators', {
        query_embedding: vector,
        match_count: 6,
        filter_category: categoryHint(question),
      });

      if (error) throw error;
      const ranked = (data ?? []) as Item[];
      const matched = ranked.filter((r) => typeof r.similarity === 'number' ? r.similarity > 0 : true).slice(0, 5);

      if (!matched.length) {
        return NextResponse.json({ ok: true, answer: '제공된 데이터에서 관련 내용을 찾지 못했습니다.', citations: [], usage: { embedding_tokens: embedding.usage?.total_tokens ?? 0, chat_total_tokens: 0 } });
      }

      const context = matched.map((item, i) => `[${i + 1}]\n${buildContent(item)}`).join('\n\n');
      const chat = await buildAnswer(openai, question, context);
      return NextResponse.json({
        ok: true,
        answer: chat.choices[0]?.message?.content ?? '',
        citations: matched.map((item) => ({
          calculator_name: item.calculator_name,
          page_path: item.page_path,
          category: item.category,
          similarity: Number((item.similarity ?? 0).toFixed(4)),
        })),
        usage: { embedding_tokens: embedding.usage?.total_tokens ?? 0, chat_total_tokens: chat.usage?.total_tokens ?? 0 },
      });
    }

    const fallback = FALLBACK_ITEMS.map((it) => ({
      it,
      score: fallbackScore(question, it),
    }))
      .sort((a, b) => b.score - a.score)
      .slice(0, FALLBACK_TOP_K)
      .filter((r) => r.score > 0);

    if (!fallback.length || !openai) {
      return NextResponse.json({ ok: true, answer: '제공된 데이터에서 관련 내용을 찾지 못했습니다.', citations: [], usage: { embedding_tokens: 0, chat_total_tokens: 0 } });
    }

    const context = fallback.map((r, i) => `[${i + 1}] (${r.it.source} / ${r.it.heading})\n${r.it.text}`).join('\n\n');
    const chat = await buildAnswer(openai, question, context);
    return NextResponse.json({
      ok: true,
      answer: chat.choices[0]?.message?.content ?? '',
      citations: fallback.map((r) => ({ calculator_name: r.it.heading, page_path: r.it.source, category: 'public-doc', similarity: Number(r.score.toFixed(4)) })),
      usage: { embedding_tokens: 0, chat_total_tokens: chat.usage?.total_tokens ?? 0 },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
