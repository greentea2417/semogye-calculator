import type { Metadata } from "next";
import { Suspense } from "react";
import HourlyMultiClient from "./HourlyMultiClient";

export const metadata: Metadata = {
  title: "시급 여러명 계산기 | 세모계",
  description: "여러 명의 시급/근무시간을 입력해 월급을 한 번에 계산해보세요.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HourlyMultiClient />
    </Suspense>
  );
}
