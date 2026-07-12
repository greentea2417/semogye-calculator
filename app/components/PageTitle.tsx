export default function PageTitle({
  title,
  subtitle,
  tone = "business",
}: {
  title: string;
  subtitle?: string;
  tone?: "business" | "life";
}) {
  const badgeClass = tone === "business"
    ? "bg-blue-50 text-blue-600"
    : "bg-emerald-50 text-emerald-600";
  const dotClass = tone === "business" ? "bg-blue-500" : "bg-emerald-500";
  const lineClass = tone === "business"
    ? "bg-gradient-to-r from-blue-600 to-sky-300"
    : "bg-gradient-to-r from-emerald-600 to-green-300";

  return (
    <header className="mb-6 text-center">
      <div className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${badgeClass}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
        계산기
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 font-['Pretendard_Variable',sans-serif]">
        {title}
      </h1>
      <div className={`mt-4 h-1 w-16 mx-auto rounded-full ${lineClass}`} />
      {subtitle ? <p className="mt-3 text-sm leading-relaxed text-gray-500">{subtitle}</p> : null}
    </header>
  );
}
