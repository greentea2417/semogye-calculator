import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-10 pt-8 pb-16 px-5">
      
      <div className="max-w-md mx-auto grid grid-cols-2 gap-8">

        {/* 비즈니스 */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            비즈니스
          </h4>
          <ul className="space-y-2">
            <li><Link href="/profit" className="text-sm text-gray-600">손익 계산기</Link></li>
            <li><Link href="/salary" className="text-sm text-gray-600">월급 계산기</Link></li>
            <li><Link href="/bonus" className="text-sm text-gray-600">상여금 계산기</Link></li>
            <li><Link href="/hourly" className="text-sm text-gray-600">시급 계산기</Link></li>
          </ul>
        </div>

        {/* 라이프 */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            라이프
          </h4>
          <ul className="space-y-2">
            <li><Link href="/life/bmi" className="text-sm text-gray-600">BMI 계산기</Link></li>
            <li><Link href="/life/body-age" className="text-sm text-gray-600">신체 나이 계산기</Link></li>
            <li><Link href="/life/grade" className="text-sm text-gray-600">학점 계산기</Link></li>
            <li><Link href="/life/waste-time" className="text-sm text-gray-600">인생 낭비 계산기</Link></li>
          </ul>
        </div>

      </div>

      {/* 하단 */}
      <div className="max-w-md mx-auto mt-8 pt-4 border-t border-gray-50 text-center">
        <p className="text-[11px] text-gray-400">
          © 2026 세모계. All rights reserved.
        </p>
      </div>

    </footer>
  );
}