import { Suspense } from "react";
import HourlyClient from "./HourlyClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HourlyClient />
    </Suspense>
  );
}
