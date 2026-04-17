import Link from "next/link";

<footer className="bg-white border-t border-gray-100 pt-10 pb-20 px-5">
  <div className="max-w-2xl mx-auto grid grid-cols-2 gap-8">
    
    {/* 비즈니스 카테고리 */}
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">비즈니스</h4>
      <ul className="space-y-2">
        <li><Link href="/profit" className="text-sm text-gray-600 hover:text-gray-900">손익계산기</Link></li>
        <li><Link href="/hourly-multi" className="text-sm text-gray-600 hover:text-gray-900">사장님용 시급계산</Link></li>
        <li><Link href="/freelance" className="text-sm text-gray-600 hover:text-gray-900">프리랜서 3.3%</Link></li>
        <li><Link href="/salary" className="text-sm text-gray-600 hover:text-gray-900">월급 실수령액</Link></li>
      </ul>
    </div>

    {/* 라이프 카테고리 */}
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">라이프</h4>
      <ul className="space-y-2">
        <li><Link href="/life/kbm" className="text-sm text-gray-600 hover:text-gray-900">키빼몸 계산기</Link></li>
        <li><Link href="/life/bmi" className="text-sm text-gray-600 hover:text-gray-900">BMI 계산기</Link></li>
        <li><Link href="/life/grade" className="text-sm text-gray-600 hover:text-gray-900">학점 계산기</Link></li>
        <li><Link href="/life/wast-time" className="text-sm text-gray-600 hover:text-gray-900">인생 낭비 환산기</Link></li>
      </ul>
    </div>

  </div>
  
  <div className="max-w-2xl mx-auto mt-10 pt-6 border-t border-gray-50 flex justify-between items-center">
    <p className="text-[11px] text-gray-400 font-medium">© 2026 세모계. All rights reserved.</p>
  </div>
</footer>