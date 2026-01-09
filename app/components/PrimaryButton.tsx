"use client";

import { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}

export default function PrimaryButton({
  children,
  onClick,
  type = "button",
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="
        w-full
        rounded-xl
        py-3
        text-base
        font-semibold
        text-white

        bg-gradient-to-b
        from-blue-400
        via-blue-500
        to-blue-700

        shadow-md
        hover:from-blue-500 hover:via-blue-600 hover:to-blue-800
        active:scale-[0.98]
        transition
      "
    >
      {children}
    </button>
  );
}
