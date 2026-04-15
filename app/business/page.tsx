const BUSINESS_TOOLS = [
  { 
    category: "사장님 필수", 
    tools: [
      { title: "주휴수당 계산기", description: "알바생 급여 산정 및 법정 수당 체크", href: "/holiday-pay" }, // /business 제거
      { title: "4대보험 계산기 (사업주)", description: "사업주 부담분 포함 총 노무비 계산", href: "/employer-insurance" } 
    ] 
  },
  { 
    category: "금융·대출", 
    tools: [
      { title: "대출부담률 계산기", description: "월 소득 대비 원리금 상환 비율(DSR) 체크", href: "/loan-ratio" } 
    ] 
  },
  { 
    category: "직장인 필수", 
    tools: [
      { title: "월급 실수령액", description: "비과세, 부양가족 반영 4대보험·소득세 자동 계산", href: "/salary" }, 
      { title: "상여금·성과급", description: "보너스 수령 시 실제 내 통장에 꽂히는 금액", href: "/bonus" } 
    ] 
  },
  { 
    category: "알바·프리랜서", 
    tools: [
      { title: "시급·알바비", description: "주휴수당, 포괄임금제 포함 월 환산 금액", href: "/hourly" }, 
      { title: "프리랜서 3.3%", description: "소득세 3.3% 제외 실지급액 및 원천징수 영수증", href: "/freelance" } 
    ] 
  },
];