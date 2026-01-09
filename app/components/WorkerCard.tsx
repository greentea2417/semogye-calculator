"use client";

interface Worker {
  name: string;
  wage: string | number;
  totalHours: string | number;
  includeHoliday: boolean;
  tax33: boolean;
}

export default function WorkerCard({
  index,
  worker,
  onChange,
  onDelete,
}: {
  index: number;
  worker: Worker;
  onChange: (index: number, updated: Worker) => void;
  onDelete: (index: number) => void;
}) {
  const update = (field: keyof Worker, value: any) => {
    onChange(index, { ...worker, [field]: value });
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow border relative space-y-4">

      {/* 삭제 버튼 */}
      <button
        onClick={() => onDelete(index)}
        className="absolute right-4 top-4 text-red-500 text-sm"
      >
        삭제
      </button>

      <h2 className="font-bold text-lg">직원 {index + 1}</h2>

      {/* 이름 */}
      <div>
        <label className="text-sm text-gray-600">이름</label>
        <input
          type="text"
          value={worker.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="예: 홍길동"
          className="w-full border p-3 rounded-lg mt-1"
        />
      </div>

      {/* 시급 */}
      <div>
        <label className="text-sm text-gray-600">시급</label>
        <input
          type="number"
          value={worker.wage}
          onChange={(e) => update("wage", e.target.value)}
          placeholder="예: 12000"
          className="w-full border p-3 rounded-lg mt-1"
        />
      </div>

      {/* 월 총 근무시간 */}
      <div>
        <label className="text-sm text-gray-600">월 총 근무시간</label>
        <input
          type="number"
          value={worker.totalHours}
          onChange={(e) => update("totalHours", e.target.value)}
          placeholder="예: 80"
          className="w-full border p-3 rounded-lg mt-1"
        />
      </div>

      {/* 토글 영역 */}
      <div className="space-y-4 mt-3">

        {/* 주휴수당 포함 여부 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">주휴수당 포함</span>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={worker.includeHoliday}
              onChange={() => update("includeHoliday", !worker.includeHoliday)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition" />
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition peer-checked:translate-x-5" />
          </label>
        </div>

        {/* 3.3% 공제 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            3.3% 공제(프리랜서)
          </span>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={worker.tax33}
              onChange={() => update("tax33", !worker.tax33)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition" />
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition peer-checked:translate-x-5" />
          </label>
        </div>

      </div>
    </div>
  );
}
