import type { Metadata } from "next";
import AnnualClient from "./AnnualClient";

export const metadata: Metadata = {
  title: "연차수당 계산기 | 세모계",
  description: "미사용 연차일수와 1일 통상임금을 바탕으로 연차수당을 계산해보세요.",
};

export default function Page() {
  return <AnnualClient />;
}
