export default function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-6 text-center">
      <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-600">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        계산기
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 font-['Pretendard_Variable',sans-serif]">
        {title}
      </h1>
      <div className="mt-4 h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-sky-300" />
      {subtitle ? <p className="mt-3 text-sm leading-relaxed text-gray-500">{subtitle}</p> : null}
    </header>
  );
}
