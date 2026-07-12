export default function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/30">{children}</div>;
}
