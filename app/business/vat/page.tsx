import type { Metadata } from "next";
export { default } from "../../vat/page";

export const metadata: Metadata = {
  title: "부가세 계산기",
  description: "매출세액에서 매입세액을 빼 이번 분기 부가세 납부·환급 세액을 계산합니다. 공급가액·부가세 구분도 함께 확인하세요.",
};
