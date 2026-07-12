"use client";

import AnimatedNumber from "./AnimatedNumber";

export default function ResultRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-b-0">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="font-semibold text-gray-900"><AnimatedNumber value={value} />원</span>
    </div>
  );
}
