import { CalendarDays, Check, Pencil, Trash2 } from 'lucide-react';
import { formatDueDate, getDueStatus, type DueStatus } from '@/lib/dates';
import type { Todo } from '@/types/todo';

const STATUS_BADGE: Record<DueStatus, { label: string; className: string } | null> = {
  none: null,
  overdue: { label: '期限切れ', className: 'bg-rose-50 text-rose-700 ring-rose-200' },
  today: { label: '今日まで', className: 'bg-amber-50 text-amber-800 ring-amber-200' },
  upcoming: { label: '予定', className: 'bg-teal-50 text-teal-800 ring-teal-200' },
};

const COMPLETED_BADGE = { label: '完了', className: 'bg-slate-100 text-slate-600 ring-slate-200' };

type Props = {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onToggleCompleted: (todo: Todo) => void;
};

export default function TodoCard({ todo, onEdit, onDelete, onToggleCompleted }: Props) {
  const done = todo.completed;
  const badge = done ? COMPLETED_BADGE : STATUS_BADGE[getDueStatus(todo.due_date)];

  return (
    <div
      className={`group relative flex h-full w-full flex-col gap-3 rounded-2xl p-5 text-left shadow-sm ring-1 transition duration-200 focus-within:ring-2 focus-within:ring-teal-500 hover:-translate-y-0.5 hover:shadow-lg hover:ring-teal-300 ${
        done ? 'bg-slate-50 ring-slate-200/70' : 'bg-white ring-slate-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          onClick={() => onToggleCompleted(todo)}
          aria-label={done ? `「${todo.title}」を未完了に戻す` : `「${todo.title}」を完了にする`}
          className={`relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
            done
              ? 'border-teal-600 bg-teal-600 text-white hover:border-teal-700 hover:bg-teal-700'
              : 'border-slate-300 bg-white text-transparent hover:border-teal-500 hover:text-teal-500/40'
          }`}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </button>

        <h3
          className={`line-clamp-2 flex-1 text-base font-semibold leading-snug transition ${
            done ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-900'
          }`}
        >
          <button
            type="button"
            onClick={() => onEdit(todo)}
            aria-label={`「${todo.title}」を編集`}
            className="text-left after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus:outline-none"
          >
            {todo.title}
          </button>
        </h3>

        <div className="relative z-10 flex shrink-0 items-center gap-1">
          <span
            aria-hidden="true"
            className="pointer-events-none rounded-full p-1.5 text-slate-400 transition group-hover:bg-teal-50 group-hover:text-teal-700"
          >
            <Pencil className="h-4 w-4" />
          </span>
          <button
            type="button"
            onClick={() => onDelete(todo)}
            aria-label={`「${todo.title}」を削除`}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {todo.content && (
        <p
          className={`line-clamp-3 whitespace-pre-line pl-8 text-sm leading-relaxed ${
            done ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          {todo.content}
        </p>
      )}

      <div className={`mt-auto flex flex-wrap items-center gap-2 pl-8 pt-1 ${done ? 'opacity-70' : ''}`}>
        {todo.due_date ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            {formatDueDate(todo.due_date)}
          </span>
        ) : (
          <span className="text-sm text-slate-400">期日なし</span>
        )}
        {badge && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${badge.className}`}
          >
            {badge.label}
          </span>
        )}
      </div>
    </div>
  );
}
