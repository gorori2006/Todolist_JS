import { SHEETS_API_URL } from '@/lib/config';
import type { Todo, TodoInput } from '@/types/todo';

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

async function callSheets<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  if (!SHEETS_API_URL) {
    throw new Error('スプレッドシートがまだ接続されていません');
  }

  const res = await fetch(SHEETS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) {
    throw new Error(`通信に失敗しました (${res.status})`);
  }

  const json = (await res.json()) as ApiResponse<T>;
  if (!json.ok) {
    throw new Error(json.error);
  }
  return json.data;
}

export function listTodos(): Promise<Todo[]> {
  return callSheets<Todo[]>('list');
}

export function createTodo(input: TodoInput): Promise<Todo> {
  return callSheets<Todo>('create', { ...input });
}

export function updateTodo(id: string, input: TodoInput): Promise<Todo> {
  return callSheets<Todo>('update', { id, ...input });
}
