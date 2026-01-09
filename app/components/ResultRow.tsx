export default function ResultRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="font-medium text-black">{label}</span>
      <span className="text-black">{value.toLocaleString()}원</span>
    </div>
  );
}
