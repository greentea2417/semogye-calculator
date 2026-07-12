"use client";

import { useEffect, useState } from "react";

export default function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = display;
    const to = value;
    const duration = 500;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const next = from + (to - from) * (1 - Math.pow(1 - progress, 3));
      setDisplay(next);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className="tabular-nums">{Math.round(display).toLocaleString()}</span>;
}
