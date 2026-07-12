import type { Metadata } from "next";
import { Suspense } from "react";
import HourlyMultiClient from "./HourlyMultiClient";

export const metadata: Metadata = {
  title: "사장님용 시급 계산기 | 세모계",
  description:
    "직원 여러 명의 시급·근무시간·주휴수당을 한 번에 입력해 사장님이 실제 부담하는 인건비를 계산해보세요.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HourlyMultiClient />
    </Suspense>
  );
}
