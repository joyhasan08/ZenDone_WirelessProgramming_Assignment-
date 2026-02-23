export enum TodoStatus {
  PENDING = 'pending',
  DONE = 'done'
}

export type Priority = 'low' | 'medium' | 'high';

export type Category = 'work' | 'personal' | 'shopping' | 'health' | 'learning' | 'other';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  title: string;
  createdAt: string;
  status: TodoStatus;
  dueDate?: string;
  priority: Priority;
  category: Category;
  subtasks: Subtask[];
  order: number;
}

export interface AppState {
  todos: Todo[];
  filter: 'all' | 'pending' | 'done';
}

export interface DeletedTodo {
  todo: Todo;
  timestamp: number;
}

export const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'work', label: 'Work', color: 'bg-blue-500' },
  { value: 'personal', label: 'Personal', color: 'bg-purple-500' },
  { value: 'shopping', label: 'Shopping', color: 'bg-orange-500' },
  { value: 'health', label: 'Health', color: 'bg-green-500' },
  { value: 'learning', label: 'Learning', color: 'bg-yellow-500' },
  { value: 'other', label: 'Other', color: 'bg-gray-500' }
];

export const PRIORITIES: { value: Priority; label: string; color: string; bgColor: string }[] = [
  { value: 'low', label: 'Low', color: 'text-slate-400', bgColor: 'bg-slate-100' },
  { value: 'medium', label: 'Medium', color: 'text-amber-500', bgColor: 'bg-amber-100' },
  { value: 'high', label: 'High', color: 'text-rose-500', bgColor: 'bg-rose-100' }
];
