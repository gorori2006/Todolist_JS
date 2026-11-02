import { useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import type { Todo } from '@/types/todo';

type Props = {
  todo: Todo;
  onCancel: () => void;
  onConfirm: (todo: Todo) => Promise<void>;
};

export default function ConfirmDeleteDialog({ todo, onCancel, onConfirm }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !deleting) onCancel();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel, deleting]);

  async function handleConfirm() {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm(todo);
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました');
      setDeleting(false);
    }
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !deleting) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-desc"
        className="animate-scale-in w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 ring-1 ring-rose-200">
          <Trash2 className="h-5 w-5 text-rose-600" />
        </div>
        <h2 id="confirm-delete-title" className="mt-4 text-lg font-bold text-slate-900">
          このやることを削除しますか？
        </h2>
        <p id="confirm-delete-desc" className="mt-2 text-sm leading-relaxed text-slate-600">
          「<span className="font-medium text-slate-900">{todo.title}</span>
          」を削除します。この操作は取り消せません。
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            autoFocus
            className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
