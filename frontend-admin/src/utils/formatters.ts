/**
 * Định dạng số tiền sang chuẩn Việt Nam Đồng (VND).
 */
export function formatVND(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Định dạng thời gian chuẩn ISO sang ngày giờ thân thiện.
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

/**
 * Rút gọn chuỗi UUID để hiển thị trên bảng.
 */
export function truncateUUID(uuid: string | null | undefined): string {
  if (!uuid) return '-';
  if (uuid.length <= 12) return uuid;
  return `${uuid.substring(0, 6)}...${uuid.substring(uuid.length - 4)}`;
}

