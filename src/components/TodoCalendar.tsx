import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toDateString, todayString } from '@/lib/dates';
import type { Todo } from '@/types/todo';

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

type DayMark = 'overdue' | 'open' | 'done';

const MARK_CLASS: Record<DayMark, string> = {
  overdue: 'bg-rose-500',
  open: 'bg-teal-500',
  done: 'bg-slate-300',
};

const MARK_PRIORITY: Record<DayMark, number> = { overdue: 2, open: 1, done: 0 };

type Props = {
  todos: Todo[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
};

export default function TodoCalendar({ todos, selectedDate, onSelectDate }: Props) {
  const today = todayString();
  const [viewMonth, setViewMonth] = useState(() => {
    const base = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  // 日付ごとの件数と印の色
  const marks = useMemo(() => {
    const map = new Map<string, { count: number; mark: DayMark }>();
    for (const t of todos) {
      if (!t.due_date) continue;
      const prev = map.get(t.due_date);
      const mark: DayMark = t.completed ? 'done' : t.due_date < today ? 'overdue' : 'open';
      // 同じ日に複数ある場合は 期限切れ > 予定あり > 完了のみ の順で優先する
      const merged = prev && MARK_PRIORITY[prev.mark] > MARK_PRIORITY[mark] ? prev.mark : mark;
      map.set(t.due_date, { count: (prev?.count ?? 0) + 1, mark: merged });
    }
    return map;
  }, [todos, today]);

  // 6週分（42日）のマス目。前後の月の日も薄く表示する
  const days = useMemo(() => {
    const start = new Date(viewMonth);
    start.setDate(1 - viewMonth.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [viewMonth]);

  function moveMonth(diff: number) {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + diff, 1));
  }

  function goToday() {
    const now = new Date();
    setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    onSelectDate(today);
  }

  return (
    <section
      aria-label="カレンダー"
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900" aria-live="polite">
          {viewMonth.getFullYear()}年{viewMonth.getMonth() + 1}月
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToday}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
          >
            今日
          </button>
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            aria-label="前の月"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            aria-label="次の月"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 text-center text-xs font-medium">
        {WEEKDAY_LABELS.map((w, i) => (
          <div
            key={w}
            className={`pb-2 ${i === 0 ? 'text-rose-500' : i === 6 ? 'text-sky-600' : 'text-slate-400'}`}
          >
            {w}
          </div>
        ))}

        {days.map((d) => {
          const key = toDateString(d);
          const inMonth = d.getMonth() === viewMonth.getMonth();
          const isToday = key === today;
          const isSelected = key === selectedDate;
          const info = marks.get(key);
          const weekday = d.getDay();

          const textColor = isSelected
            ? 'text-white'
            : !inMonth
              ? 'text-slate-300'
              : weekday === 0
                ? 'text-rose-600'
                : weekday === 6
                  ? 'text-sky-700'
                  : 'text-slate-700';

          return (
            <div key={key} className="flex justify-center py-0.5">
              <button
                type="button"
                onClick={() => onSelectDate(isSelected ? null : key)}
                aria-pressed={isSelected}
                aria-label={`${d.getMonth() + 1}月${d.getDate()}日${info ? `、予定 ${info.count} 件` : ''}`}
                className={`relative flex h-10 w-10 flex-col items-center justify-center rounded-xl text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${textColor} ${
                  isSelected
                    ? 'bg-teal-600 font-semibold shadow-sm'
                    : isToday
                      ? 'font-semibold ring-1 ring-inset ring-teal-500 hover:bg-teal-50'
                      : 'hover:bg-slate-100'
                }`}
              >
                {d.getDate()}
                {info && (
                  <span
                    className={`absolute bottom-1.5 h-1 w-1 rounded-full ${
                      isSelected ? 'bg-white' : MARK_CLASS[info.mark]
                    } ${inMonth ? '' : 'opacity-50'}`}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <Legend className="bg-teal-500" label="予定あり" />
        <Legend className="bg-rose-500" label="期限切れ" />
        <Legend className="bg-slate-300" label="完了のみ" />
      </div>
    </section>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}
