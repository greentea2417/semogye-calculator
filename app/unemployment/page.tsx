import type { Metadata } from "next";
import UnemploymentClient from "./UnemploymentClient";

export const metadata: Metadata = {
  title: "실업급여 계산기 | 세모계",
  description: "고용보험 가입기간, 평균임금, 나이를 바탕으로 예상 실업급여를 계산해보세요. 구직급여 예상액과 수급기간을 간단히 확인할 수 있습니다.",
};

export default function Page() {
  return <UnemploymentClient />;
}
