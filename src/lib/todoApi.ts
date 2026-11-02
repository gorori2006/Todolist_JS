import type { Todo, TodoInput } from '@/types/todo';

const STORAGE_KEY = 'todos';

function readTodos(): Todo[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Todo[]) : [];
  } catch {
    return [];
  }
}

function writeTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    throw new Error('保存に失敗しました（ブラウザの保存容量を確認してください）');
  }
}

export async function listTodos(): Promise<Todo[]> {
  return readTodos();
}

export async function createTodo(input: TodoInput): Promise<Todo> {
  const now = new Date().toISOString();
  const todo: Todo = {
    id: crypto.randomUUID(),
    ...input,
    created_at: now,
    updated_at: now,
  };
  writeTodos([...readTodos(), todo]);
  return todo;
}

export async function updateTodo(id: string, input: TodoInput): Promise<Todo> {
  const todos = readTodos();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('対象のやることが見つかりません');

  const todo: Todo = { ...todos[index], ...input, updated_at: new Date().toISOString() };
  todos[index] = todo;
  writeTodos(todos);
  return todo;
}

export async function deleteTodo(id: string): Promise<void> {
  const todos = readTodos();
  if (!todos.some((t) => t.id === id)) throw new Error('対象のやることが見つかりません');
  writeTodos(todos.filter((t) => t.id !== id));
}
