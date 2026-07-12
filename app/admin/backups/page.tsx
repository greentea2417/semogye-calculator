"use client";

import { useState } from "react";

const ADMIN_PASSWORD = "semogye2026"; // TODO: 운영 시 더 안전한 값으로 교체하세요

// 백업 대상 데이터 — 세모계는 별도 DB가 없는 정적 사이트라,
// 계산기 카탈로그와 사이트 기본 설정을 백업 대상으로 삼습니다.
// 결제 링크·비밀번호·API 키 등 민감정보는 절대 포함하지 않습니다.
const backupData = {
  exportedAt: new Date().toISOString(),
  site: {
    name: "세모계",
    domain: "semogye.com",
  },
  categories: [
    {
      slug: "business",
      label: "비즈니스 계산기",
      groups: [
        {
          label: "사장님 필수",
          items: [
            { slug: "profit", title: "손익 계산기", href: "/business/profit" },
            { slug: "hourly-multi", title: "사장님용 시급 계산기", href: "/business/hourly-multi" },
          ],
        },
        {
          label: "급여 · 보상",
          items: [
            { slug: "salary", title: "월급 계산기", href: "/business/salary" },
            { slug: "bonus", title: "상여금 계산기", href: "/business/bonus" },
          ],
        },
        {
          label: "근로 · 계약",
          items: [
            { slug: "hourly", title: "시급 계산기", href: "/business/hourly" },
            { slug: "compare", title: "알바 vs 프리랜서", href: "/business/compare" },
          ],
        },
        {
          label: "대출 · 금융",
          items: [
            { slug: "burden", title: "내 월급으로 이 대출 괜찮을까?", href: "/business/burden" },
          ],
        },
      ],
    },
    {
      slug: "life",
      label: "라이프 계산기",
      groups: [
        {
          label: "건강",
          items: [
            { slug: "bmi", title: "BMI 계산기", href: "/life/bmi" },
            { slug: "body-age", title: "신체 나이 계산기", href: "/life/body-age" },
            { slug: "kbm", title: "키빼몸 계산기", href: "/life/kbm" },
          ],
        },
        {
          label: "학습",
          items: [{ slug: "grade", title: "학점 계산기", href: "/life/grade" }],
        },
        {
          label: "재미",
          items: [
            { slug: "waste-time", title: "내가 날린 인생 시간은?", href: "/life/waste-time" },
          ],
        },
      ],
    },
  ],
  pricing: {
    productName: "리포트 팩",
    price: 3900,
    currency: "KRW",
    features: ["엑셀·PDF 무제한 다운로드", "여러 달 합산 계산", "평생 이용(원타임 결제)"],
  },
};

function downloadJson() {
  const json = JSON.stringify(backupData, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `semogye-backup-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminBackupsPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      setUnlocked(true);
      setError("");
    } else {
      setError("비밀번호가 올바르지 않습니다.");
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full"
        >
          <h1 className="text-lg font-extrabold text-gray-900 mb-1">관리자 로그인</h1>
          <p className="text-sm text-gray-500 mb-5">백업 페이지는 관리자만 접근할 수 있어요.</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="관리자 비밀번호"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
          <button
            type="submit"
            className="w-full px-5 py-3 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            로그인
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="max-w-lg mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold tracking-wide mb-5">
          관리자 전용
        </span>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">DB 백업</h1>
        <p className="text-sm text-gray-500 mb-8">
          계산기 카탈로그, 사이트 설정 등 주요 데이터를 JSON 파일로 내보냅니다. 비밀번호·API
          키·결제 관련 비밀값은 절대 포함되지 않습니다.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-3">백업에 포함되는 데이터</h2>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li>✓ 계산기 카탈로그 (카테고리·항목 목록)</li>
            <li>✓ 사이트 기본 설정</li>
            <li>✓ 가격 정책 정보</li>
          </ul>
        </div>

        <div className="bg-red-50 rounded-2xl border border-red-100 p-6 mb-8">
          <h2 className="font-bold text-red-700 mb-3">백업에서 제외되는 데이터</h2>
          <ul className="space-y-1.5 text-sm text-red-600">
            <li>✕ 결제 링크 / 결제 관련 비밀값</li>
            <li>✕ 비밀번호, API 키, 토큰</li>
            <li>✕ 사용자 개인정보 (수집하지 않음)</li>
          </ul>
        </div>

        <button
          onClick={downloadJson}
          className="w-full px-6 py-4 rounded-full bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors"
        >
          📦 백업 다운로드 (JSON)
        </button>
      </div>
    </div>
  );
}
