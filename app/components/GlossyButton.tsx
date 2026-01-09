"use client";

export default function GlossyButton({
  children,
  onClick,
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden w-full py-3 rounded-xl
        font-semibold text-white
        active:scale-[0.98] transition-all duration-200
        bg-gradient-to-b from-blue-400 to-blue-600
        shadow-[0_4px_12px_rgba(0,0,0,0.15)]
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>

      {!disabled && (
        <span className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-white/70 opacity-40" />
      )}
    </button>
  );
}
