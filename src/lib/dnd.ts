import type { DragEvent } from 'react';

/** ドラッグ中の ToDo の id を受け渡すためのデータ形式 */
export const TODO_DRAG_TYPE = 'application/x-todo-id';

export function isTodoDrag(e: DragEvent): boolean {
  return e.dataTransfer.types.includes(TODO_DRAG_TYPE);
}
