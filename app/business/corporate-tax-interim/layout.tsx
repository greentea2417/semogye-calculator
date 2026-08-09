import type { Metadata } from "next";
import { buildCalcMetadata } from "@/lib/calcMeta";

export const metadata: Metadata = buildCalcMetadata("business/corporate-tax-interim");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}