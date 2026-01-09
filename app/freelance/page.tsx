import { Suspense } from "react";
import FreelanceClient from "./FreelanceClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FreelanceClient />
    </Suspense>
  );
}
