// Định dạng dữ liệu thống nhất theo chuẩn SRS Hệ thống MTC (Trang 18)

export function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + ' đ';
}

export function formatStorage(mb: number): string {
  if (mb >= 1024) {
    return (mb / 1024).toFixed(1) + ' GB';
  }
  return mb + ' MB';
}

/**
 * Định dạng thời gian tương đối thống nhất (SRS 5.1 & 5.2 - Trang 18):
 * - vừa xong
 * - [x] phút trước (dưới 60 phút)
 * - [x] giờ trước (dưới 24 giờ)
 * - [x] ngày trước (dưới 7 ngày)
 * - từ dd/mm/yy (trên 7 ngày)
 */
export function formatRelativeTime(dateStrOrTimestamp: string | number | Date): string {
  const date = new Date(dateStrOrTimestamp);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) {
    return 'vừa xong';
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} phút trước`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays <= 7) {
    return `${diffDays} ngày trước`;
  }

  // Quá 7 ngày -> từ dd/mm/yy
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `từ ${dd}/${mm}/${yy}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
