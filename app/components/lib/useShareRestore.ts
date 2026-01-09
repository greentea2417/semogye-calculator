import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { decodeShareState } from "./shareState";

export function useShareRestore<TInputs>({
  restore,
}: {
  restore: (inputs: TInputs) => void;
}) {
  const sp = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const dataParam = sp.get("data");
    if (!dataParam) return;

    const decoded = decodeShareState<{ v: 1; inputs: TInputs }>(dataParam);
    const inputs = decoded?.inputs;
    if (!inputs) return;

    // ✅ 입력 복원
    restore(inputs);

    // ✅ URL 정리 (data 제거)
    const url = new URL(window.location.href);
    url.searchParams.delete("data");
    router.replace(url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
