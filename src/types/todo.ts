export type Todo = {
  id: string;
  title: string;
  content: string;
  due_date: string;
  created_at: string;
  updated_at: string;
};

export type TodoInput = Pick<Todo, 'title' | 'content' | 'due_date'>;
