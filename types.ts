
export enum TodoStatus {
  PENDING = 'pending',
  DONE = 'done'
}

export interface Todo {
  id: string;
  title: string;
  createdAt: string;
  status: TodoStatus;
}

export interface AppState {
  todos: Todo[];
  filter: 'all' | 'pending' | 'done';
}
