export async function copyToClipboardSafe(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

export function buildShareUrl(path: string, encodedData: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${path}?data=${encodeURIComponent(encodedData)}`;
}

export async function shareOrCopy(title: string, url: string) {
  if ((navigator as any).share) {
    try {
      await (navigator as any).share({ title, url });
      return { ok: true, method: "share" as const };
    } catch {
      // 사용자가 공유 취소/권한 이슈 → 복사로 fallback
    }
  }
  await copyToClipboardSafe(url);
  return { ok: true, method: "copy" as const };
}
