// src/lib/shareState.ts
export type SharePayload<T> = {
  v: 1;          // 버전(나중에 스키마 바뀌어도 대응)
  t: number;     // timestamp
  s: T;          // state
};

// base64url encode/decode (브라우저 전용)
function toBase64Url(str: string) {
  const b64 =
    typeof window !== "undefined"
      ? btoa(unescape(encodeURIComponent(str)))
      : Buffer.from(str, "utf-8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(b64url: string) {
  const pad = b64url.length % 4 ? "=".repeat(4 - (b64url.length % 4)) : "";
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + pad;

  const str =
    typeof window !== "undefined"
      ? decodeURIComponent(escape(atob(b64)))
      : Buffer.from(b64, "base64").toString("utf-8");

  return str;
}

export function encodeShareState<T>(state: T) {
  const payload: SharePayload<T> = { v: 1, t: Date.now(), s: state };
  return toBase64Url(JSON.stringify(payload));
}

export function decodeShareState<T>(encoded: string): T | null {
  try {
    const raw = fromBase64Url(encoded);
    const parsed = JSON.parse(raw) as SharePayload<T>;
    if (!parsed || parsed.v !== 1 || typeof parsed.s === "undefined") return null;
    return parsed.s as T;
  } catch {
    return null;
  }
}
