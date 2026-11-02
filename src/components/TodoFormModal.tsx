import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Loader2, X } from 'lucide-react';
import { createTodo, updateTodo } from '@/lib/todoApi';
import type { Todo, TodoInput } from '@/types/todo';

const TITLE_MAX = 100;
const CONTENT_MAX = 1000;

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15';

type Props = {
  todo: Todo | null;
  /** 新規作成時の期日の初期値（カレンダーで日付を選んでいるとき） */
  defaultDueDate?: string;
  onClose: () => void;
  onSaved: (todo: Todo) => void;
};

export default function TodoFormModal({ todo, defaultDueDate = '', onClose, onSaved }: Props) {
  const [title, setTitle] = useState(todo?.title ?? '');
  const [content, setContent] = useState(todo?.content ?? '');
  const [dueDate, setDueDate] = useState(todo?.due_date ?? defaultDueDate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = todo !== null;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !saving) onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, saving]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input: TodoInput = {
      title: title.trim(),
      content: content.trim(),
      due_date: dueDate,
    };

    if (!input.title) {
      setError('タイトルを入力してください');
      return;
    }
    if (input.title.length > TITLE_MAX || input.content.length > CONTENT_MAX) {
      setError('入力内容が文字数の上限を超えています');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const saved = todo ? await updateTodo(todo.id, input) : await createTodo(input);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="todo-form-title"
        className="animate-scale-in max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="todo-form-title" className="text-xl font-bold text-slate-900">
            {isEdit ? 'やることを編集' : '新しいやること'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="閉じる"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="タイトル" htmlFor="todo-title" hint={`${title.length}/${TITLE_MAX}`}>
            <input
              id="todo-title"
              type="text"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 企画書のドラフトを作成"
              className={inputClass}
              autoFocus
            />
          </Field>

          <Field label="内容" htmlFor="todo-content" hint={`${content.length}/${CONTENT_MAX}`}>
            <textarea
              id="todo-content"
              value={content}
              maxLength={CONTENT_MAX}
              onChange={(e) => setContent(e.target.value)}
              placeholder="詳しいメモや手順など"
              rows={4}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <Field label="期日" htmlFor="todo-due">
            <div className="flex items-center gap-3">
              <input
                id="todo-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="shrink-0 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  クリア
                </button>
              )}
            </div>
          </Field>

          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? '変更を保存' : '追加する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
