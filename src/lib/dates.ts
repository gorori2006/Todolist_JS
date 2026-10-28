export type DueStatus = 'none' | 'overdue' | 'today' | 'upcoming';

export function todayString(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
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
