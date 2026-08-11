import type { Metadata } from "next";
import RetirementClient from "./RetirementClient";

export const metadata: Metadata = {
  title: "퇴직금 계산기 | 세모계",
  description: "최근 3개월 평균임금과 재직일수를 바탕으로 퇴직금을 계산해보세요. 세전 퇴직금과 예상 세금을 함께 확인할 수 있습니다.",
};

export default function Page() {
  return <RetirementClient />;
}
