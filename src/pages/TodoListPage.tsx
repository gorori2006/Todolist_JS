import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ClipboardList, Loader2, Plus, RefreshCw } from 'lucide-react';
import TodoCard from '@/components/TodoCard';
import TodoFormModal from '@/components/TodoFormModal';
import { getDueStatus } from '@/lib/dates';
import { listTodos } from '@/lib/todoApi';
import type { Todo } from '@/types/todo';

type FormState = { todo: Todo | null };

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTodos(await listTodos());
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(() => {
    return [...todos].sort((a, b) => {
      if (!a.due_date && !b.due_date) return b.updated_at.localeCompare(a.updated_at);
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date) || b.updated_at.localeCompare(a.updated_at);
    });
  }, [todos]);

  const overdueCount = todos.filter((t) => getDueStatus(t.due_date) === 'overdue').length;

  function handleSaved(saved: Todo) {
    setTodos((prev) =>
      prev.some((t) => t.id === saved.id)
        ? prev.map((t) => (t.id === saved.id ? saved : t))
        : [saved, ...prev]
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-teal-100/60 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700">
              <ClipboardList className="h-4 w-4" />
              やることリスト
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              今日やることを、きちんと整える
            </h1>
            {!loading && !error && (
              <p className="text-sm text-slate-600">
                全 {todos.length} 件
                {overdueCount > 0 && (
                  <span className="ml-2 font-medium text-rose-700">期限切れ {overdueCount} 件</span>
                )}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setForm({ todo: null })}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-md active:translate-y-0 sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            新しいやること
          </button>
        </header>

        <main className="mt-10">
          {loading && (
            <div className="flex items-center justify-center gap-3 py-24 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              読み込み中です
            </div>
          )}

          {!loading && error && (
            <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-rose-200">
              <AlertTriangle className="mx-auto h-8 w-8 text-rose-600" />
              <p className="mt-4 font-semibold text-slate-900">やることを読み込めませんでした</p>
              <p className="mt-2 text-sm text-slate-600">{error}</p>
              <button
                type="button"
                onClick={() => void load()}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                再読み込み
              </button>
            </div>
          )}

          {!loading && !error && todos.length === 0 && (
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center">
              <ClipboardList className="mx-auto h-10 w-10 text-teal-600" />
              <p className="mt-4 font-semibold text-slate-900">まだやることがありません</p>
              <p className="mt-2 text-sm text-slate-600">
                「新しいやること」から最初の一件を登録しましょう。
              </p>
            </div>
          )}

          {!loading && !error && sorted.length > 0 && (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((todo) => (
                <li key={todo.id}>
                  <TodoCard todo={todo} onEdit={(t) => setForm({ todo: t })} />
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>

      {form && (
        <TodoFormModal
          todo={form.todo}
          onClose={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
