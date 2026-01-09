"use client";

import React from "react";

type InputBlockProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string; // label은 선택
};

export default function InputBlock({
  label,
  value,
  className,
  ...props
}: InputBlockProps) {
  const isEmpty = value === "" || value === undefined || value === null;

  return (
    <div className="input-block">
      {label ? <label className="input-label">{label}</label> : null}

      <input
        {...props}
        value={value ?? ""}
        className={[
          "input-field",
          !isEmpty ? "prefilled" : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </div>
  );
}
