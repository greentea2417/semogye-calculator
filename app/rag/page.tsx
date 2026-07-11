"use client";

import { useState } from 'react';

export default function RagPage() {
  const [question, setQuestion] = useState('세모계의 계산기 제작 원칙은 무엇인가?');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [citations, setCitations] = useState<any[]>([]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">세모계 RAG 챗봇 MVP</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">기존 임베딩으로 답하는 세모계 챗봇</h1>
          <p className="mt-3 text-gray-600">새 임베딩 없이 ChromaDB의 기존 지식을 바탕으로 답변합니다. 과제 제출 가능한 최소 기능 MVP입니다.</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">질문</label>
          <textarea
            className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-28"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="예: 세모계의 SEO 우선순위는?"
          />
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? '검색 중...' : '질문하기'}
            </button>
            <a href="/" className="text-sm text-gray-500 hover:text-gray-900">홈으로</a>
          </div>
        </form>

        {error ? <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}
        {answer ? (
          <section className="mt-6 rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-2">답변</h2>
            <p className="whitespace-pre-wrap leading-7 text-gray-800">{answer}</p>
          </section>
        ) : null}
        {citations.length ? (
          <section className="mt-6 rounded-2xl border border-gray-200 p-5 bg-gray-50">
            <h2 className="font-bold text-gray-900 mb-3">출처</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              {citations.map((c, i) => (
                <li key={i} className="rounded-lg bg-white border border-gray-200 p-3">
                  {c.source} · {c.heading} · 유사도 {(c.similarity ?? 0).toFixed(3)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}
