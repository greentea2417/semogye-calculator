"use client";

import React from "react";
import Link from "next/link";

const BUSINESS_TOOLS = [
  {
    category: "핵심 도구",
    tools: [
      // 1. 사장님 계산기: 폴더명이 'profit'입니다.
      { 
        title: "사장님 계산기", 
        description: "판매가 대비 순이익 및 마진율을 한눈에 확인", 
        href: "/business/profit" 
      },
      // 2. 대출부담 계산기: 폴더명이 'burden'입니다.
      { 
        title: "대출부담 계산기", 
        description: "월 소득 대비 원리금 상환 비율(DSR) 체크", 
        href: "/business/burden" 
      },
    ],
  },
];

export default function BusinessPage() {
  return (
    <main className="max-w-xl mx-auto px-5 py-16 space-y-16">
      {/* 헤더 섹션 - 중앙 정렬 */}
      <section className="flex flex-col items-center text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter italic">비즈니스·금융</h1>
        <p className="text-sm text-gray-400 font-medium">사장님을 위한 필수 정산 도구</p>
      </section>

      <div className="space-y-16">
        {BUSINESS_TOOLS.map((group, idx) => (
          <section key={idx} className="space-y-8">
            {/* 카테고리 구분선 */}
            <div className="flex items-center space-x-5 px-2">
              <div className="h-[1px] flex-1 bg-gray-100"></div>
              <span className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">{group.category}</span>
              <div className="h-[1px] flex-1 bg-gray-100"></div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {group.tools.map((tool, tIdx) => (
                <Link 
                  key={tIdx} 
                  href={tool.href} 
                  className="group block bg-white border border-gray-100 p-7 rounded-[32px] hover:border-blue-600 transition-all duration-300 shadow-sm shadow-gray-200/20"
                >
                  <div className="flex justify-between items-center text-left px-2">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-lg text-gray-900">{tool.title}</h3>
                      <p className="text-xs text-gray-400 font-medium">{tool.description}</p>
                    </div>
                    {/* 호버 시 파란색으로 변하는 화살표 */}
                    <span className="text-xl text-gray-200 group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1 duration-300">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="pt-20 text-center">
        <p className="text-[10px] font-bold text-gray-200 uppercase tracking-[0.2em]">Designed by greentea • 2026</p>
      </footer>
    </main>
  );
}