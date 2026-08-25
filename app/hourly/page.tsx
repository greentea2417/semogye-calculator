import type { Metadata } from "next";
import { Suspense } from "react";
import HourlyClient from "./HourlyClient";

export const metadata: Metadata = {
  title: "시급 계산기",
  description: "시급과 월 근로시간으로 월 총 급여(세전)를 계산합니다. 주휴수당 포함 여부도 선택할 수 있습니다.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HourlyClient />
    </Suspense>
  );
}
