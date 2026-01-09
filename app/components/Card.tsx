export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      {children}
    </div>
  );
}
