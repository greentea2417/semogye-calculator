import { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인사업자 순이익 계산기 | 세모계",
  description: "매출에서 임대료, 인건비, 재료비를 뺀 진짜 순수익을 계산해보세요. 사장님을 위한 간편 손익 리포트.",
  openGraph: {
    title: "개인사업자 순기익 계산기 | 세모계",
    description: "이번 달 우리 가게, 진짜 얼마나 남았을까? 1분 만에 확인하는 손익 리포트",
  },
};

export default function ProfitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}