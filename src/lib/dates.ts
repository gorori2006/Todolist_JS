export type DueStatus = 'none' | 'overdue' | 'today' | 'upcoming';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

/** Date をローカル時刻の 'YYYY-MM-DD' に変換する */
export function toDateString(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function todayString(): string {
  return toDateString(new Date());
}

/** '2026-11-03' → '11月3日（火）' */
export function formatDayWithWeekday(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  return `${month}月${day}日（${weekday}）`;
}

export function getDueStatus(dueDate: string): DueStatus {
  if (!dueDate) return 'none';
  const today = todayString();
  if (dueDate < today) return 'overdue';
  if (dueDate === today) return 'today';
  return 'upcoming';
}

export function formatDueDate(dueDate: string): string {
  const [year, month, day] = dueDate.split('-');
  return `${year}年${Number(month)}月${Number(day)}日`;
}
