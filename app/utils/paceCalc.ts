// 러닝 페이스 계산기 순수 로직
// pace = 총 시간 ÷ 거리 (1km당 소요 시간), 평균 속도 = 거리 ÷ 시간

export type PaceResult = {
  paceSecPerKm: number; // 1km당 소요 초
  speedKmh: number; // 평균 속도 (km/h)
};

/** 시/분/초를 총 초로 합산 */
export function toTotalSeconds(hours: number, minutes: number, seconds: number): number {
  const h = Number.isFinite(hours) ? hours : 0;
  const m = Number.isFinite(minutes) ? minutes : 0;
  const s = Number.isFinite(seconds) ? seconds : 0;
  return h * 3600 + m * 60 + s;
}

export function calcPace(distanceKm: number, totalSeconds: number): PaceResult | null {
  if (!(distanceKm > 0) || !(totalSeconds > 0)) return null;
  const paceSecPerKm = totalSeconds / distanceKm;
  const speedKmh = distanceKm / (totalSeconds / 3600);
  return { paceSecPerKm, speedKmh };
}

/** 초 단위 페이스를 mm:ss 로 포맷 (반올림 시 60초 넘김 보정) */
export function formatPace(paceSecPerKm: number): string {
  if (!(paceSecPerKm > 0)) return "-";
  const totalRounded = Math.round(paceSecPerKm);
  const m = Math.floor(totalRounded / 60);
  const s = totalRounded % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
