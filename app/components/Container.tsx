export default function Container({ children }: { children: React.ReactNode }) {
  return <div className="max-w-xl mx-auto px-4">{children}</div>;
}
