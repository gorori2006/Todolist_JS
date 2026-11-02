import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarX2, ClipboardList, Loader2, Plus, RefreshCw, X } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import TodoCalendar from '@/components/TodoCalendar';
import TodoCard from '@/components/TodoCard';
import TodoFormModal from '@/components/TodoFormModal';
import { formatDayWithWeekday, getDueStatus } from '@/lib/dates';
import { deleteTodo, listTodos, setTodoCompleted } from '@/lib/todoApi';
import type { Todo } from '@/types/todo';

type FormState = { todo: Todo | null };

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [deleting, setDeleting] = useState<Todo | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
      // 未完了を上、完了済みを下（完了済みは新しく完了したものから）
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.completed) return b.completed_at.localeCompare(a.completed_at);
      if (!a.due_date && !b.due_date) return b.updated_at.localeCompare(a.updated_at);
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date) || b.updated_at.localeCompare(a.updated_at);
    });
  }, [todos]);

  const visible = useMemo(
    () => (selectedDate ? sorted.filter((t) => t.due_date === selectedDate) : sorted),
    [sorted, selectedDate]
  );

  const overdueCount = todos.filter(
    (t) => !t.completed && getDueStatus(t.due_date) === 'overdue'
  ).length;
  const completedCount = todos.filter((t) => t.completed).length;

  function handleSaved(saved: Todo) {
    setTodos((prev) =>
      prev.some((t) => t.id === saved.id)
        ? prev.map((t) => (t.id === saved.id ? saved : t))
        : [saved, ...prev]
    );
  }

  async function handleToggleCompleted(todo: Todo) {
    try {
      handleSaved(await setTodoCompleted(todo.id, !todo.completed));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '更新に失敗しました');
    }
  }

  async function handleDelete(todo: Todo) {
    await deleteTodo(todo.id);
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    setDeleting(null);
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
                {completedCount > 0 && (
                  <span className="ml-2 text-slate-500">完了 {completedCount} 件</span>
                )}
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

          {!loading && !error && (
            <div className="grid items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="lg:sticky lg:top-6">
                <TodoCalendar
                  todos={todos}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </aside>

              <section aria-labelledby="list-heading" className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 id="list-heading" className="text-lg font-bold text-slate-900">
                    {selectedDate ? `${formatDayWithWeekday(selectedDate)}の予定` : 'すべてのやること'}
                    <span className="ml-2 text-sm font-medium text-slate-500">{visible.length} 件</span>
                  </h2>
                  {selectedDate && (
                    <button
                      type="button"
                      onClick={() => setSelectedDate(null)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900"
                    >
                      <X className="h-4 w-4" />
                      すべて表示
                    </button>
                  )}
                </div>

                {todos.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center">
                    <ClipboardList className="mx-auto h-10 w-10 text-teal-600" />
                    <p className="mt-4 font-semibold text-slate-900">まだやることがありません</p>
                    <p className="mt-2 text-sm text-slate-600">
                      「新しいやること」から最初の一件を登録しましょう。
                    </p>
                  </div>
                )}

                {todos.length > 0 && selectedDate && visible.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center">
                    <CalendarX2 className="mx-auto h-10 w-10 text-slate-400" />
                    <p className="mt-4 font-semibold text-slate-900">この日の予定はありません</p>
                    <button
                      type="button"
                      onClick={() => setForm({ todo: null })}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 ring-1 ring-teal-200 transition hover:bg-teal-50"
                    >
                      <Plus className="h-4 w-4" />
                      この日にやることを追加
                    </button>
                  </div>
                )}

                {visible.length > 0 && (
                  <ul className="grid gap-5 sm:grid-cols-2">
                    {visible.map((todo) => (
                      <li key={todo.id}>
                        <TodoCard
                          todo={todo}
                          onEdit={(t) => setForm({ todo: t })}
                          onDelete={setDeleting}
                          onToggleCompleted={(t) => void handleToggleCompleted(t)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
        </main>
      </div>

      {form && (
        <TodoFormModal
          todo={form.todo}
          defaultDueDate={selectedDate ?? ''}
          onClose={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}

      {deleting && (
        <ConfirmDeleteDialog
          todo={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
