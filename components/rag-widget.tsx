"use client";

import { useState } from 'react';

type Citation = { calculator_name: string; page_path: string; category?: string; similarity?: number };

export default function RagWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('자영업자에게 추천할 계산기 3개와 이유를 알려줘');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);

  async function submit() {
    setLoading(true);
    setError('');
    setAnswer('');
    setCitations([]);
    try {
      const res = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || '요청 실패');
      setAnswer(data.answer || '');
      setCitations(data.citations || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-900/20"
      >
        {open ? '닫기' : '세모계 챗봇'}
      </button>
      {open ? (
        <div className="fixed bottom-20 right-5 z-40 w-[min(92vw,380px)] rounded-3xl border border-gray-200 bg-white p-4 shadow-2xl shadow-gray-900/10">
          <p className="text-sm font-semibold text-blue-600">계산기 추천 · 콘텐츠 초안 생성</p>
          <textarea
            className="mt-3 min-h-28 w-full rounded-2xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            onClick={submit}
            disabled={loading}
            className="mt-3 w-full rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? '검색 중...' : '질문하기'}
          </button>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          {answer ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-800">{answer}</p> : null}
          {citations.length ? (
            <div className="mt-3 space-y-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
              {citations.map((c, i) => (
                <div key={i} className="rounded-xl bg-gray-50 p-2">
                  {c.calculator_name} · {c.page_path}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
