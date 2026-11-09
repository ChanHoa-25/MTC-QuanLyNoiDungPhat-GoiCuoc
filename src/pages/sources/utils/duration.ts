/**
 * Tiện ích xử lý thời lượng dạng "HH:mm:ss" dùng chung cho module nguồn thông tin.
 */

const DURATION_PATTERN = /^(\d{1,3}):([0-5]\d):([0-5]\d)$/;

/** Kiểm tra chuỗi có đúng định dạng HH:mm:ss (giờ cho phép 1-3 chữ số). */
export function isValidDuration(value: string): boolean {
  return DURATION_PATTERN.test(value.trim());
}

/** Đổi "HH:mm:ss" sang số giây. Trả về 0 nếu sai định dạng. */
export function durationToSeconds(value: string | undefined | null): number {
  if (!value) return 0;
  const match = DURATION_PATTERN.exec(value.trim());
  if (!match) return 0;
  const [, h, m, s] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

/** Đổi số giây sang "HH:mm:ss". */
export function secondsToDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const pad = (n: number) => String(n).padStart(2, "0");
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** Tính tổng thời lượng của danh sách chuỗi "HH:mm:ss". */
export function sumDurations(values: Array<string | undefined | null>): string {
  return secondsToDuration(
    values.reduce<number>((total, value) => total + durationToSeconds(value), 0),
  );
}

