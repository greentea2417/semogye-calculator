import { Suspense } from "react";
import SalaryClient from "./SalaryClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SalaryClient />
    </Suspense>
  );
}
