type QA = { q: string; a: string };

export default function AccordionFAQ({ title, items }: { title: string; items: QA[] }) {
  return (
    <section className="mt-10 space-y-4">
      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <span aria-hidden>❓</span>
          <p className="font-semibold text-gray-900">{title}</p>
        </div>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <details key={idx} className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm shadow-gray-200/20">
              <summary className="cursor-pointer list-none text-sm font-medium text-gray-900">
                {item.q}
              </summary>
              <div className="mt-2 text-sm leading-6 text-gray-700">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
