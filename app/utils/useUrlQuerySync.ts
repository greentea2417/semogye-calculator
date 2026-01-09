"use client";

import { useEffect, useRef } from "react";

type Codec<T> = {
  // URL -> state에 넣을 값 (예: "12000" -> "12,000")
  decode: (raw: string) => T;
  // state -> URL에 넣을 값 (예: "12,000" -> "12000")
  encode: (value: T) => string | null; // null이면 쿼리에서 제거
};

type Field<T> = {
  key: string;                 // 쿼리 키 (예: w, h, f)
  value: T;                    // 현재 state 값
  setValue: (v: T) => void;    // setState
  codec: Codec<T>;
};

type Options = {
  replace?: boolean; // 기본 true: replaceState
};

export function useUrlQuerySync(fields: Field<any>[], options: Options = {}) {
  const didInit = useRef(false);
  const replace = options.replace ?? true;

  // 1) 최초 1회: URL -> state
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const params = new URLSearchParams(window.location.search);

    fields.forEach((f) => {
      const raw = params.get(f.key);
      if (raw != null && raw !== "") {
        try {
          f.setValue(f.codec.decode(raw));
        } catch {
          // decode 실패하면 무시
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) state 변경: state -> URL
  useEffect(() => {
    if (!didInit.current) return;

    const params = new URLSearchParams(window.location.search);

    fields.forEach((f) => {
      const encoded = f.codec.encode(f.value);
      if (encoded == null || encoded === "") {
        params.delete(f.key);
      } else {
        params.set(f.key, encoded);
      }
    });

    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;

    if (replace) window.history.replaceState(null, "", newUrl);
    else window.history.pushState(null, "", newUrl);
  }, [replace, fields]);
}

/** 자주 쓰는 코덱들 */
export const codecs = {
  // "12000" <-> "12,000"
  numberCommaString: {
    decode: (raw: string) => {
      const n = Number(String(raw).replace(/[^\d]/g, "")) || 0;
      return n ? n.toLocaleString("ko-KR") : "";
    },
    encode: (value: string) => {
      const n = Number(String(value).replace(/[^\d]/g, "")) || 0;
      return n > 0 ? String(n) : null;
    },
  } as Codec<string>,

  // "160" <-> "160" (콤마 없이 숫자 문자열)
  numberPlainString: {
    decode: (raw: string) => {
      const n = Number(String(raw).replace(/[^\d]/g, "")) || 0;
      return n > 0 ? String(n) : "";
    },
    encode: (value: string) => {
      const n = Number(String(value).replace(/[^\d]/g, "")) || 0;
      return n > 0 ? String(n) : null;
    },
  } as Codec<string>,

  // "5" <-> 5 (number)
  intNumber: {
    decode: (raw: string) => {
      const n = Number(String(raw).replace(/[^\d]/g, "")) || 0;
      return n;
    },
    encode: (value: number) => {
      const n = Number.isFinite(value) ? Math.floor(value) : 0;
      return n > 0 ? String(n) : null;
    },
  } as Codec<number>,

  // "yes"/"no"
  yesNo: {
    decode: (raw: string) => (raw === "no" ? ("no" as const) : ("yes" as const)),
    encode: (value: "yes" | "no") => (value ? String(value) : null),
  } as Codec<"yes" | "no">,
};
