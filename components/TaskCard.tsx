
import React from 'react';
import { Todo, TodoStatus } from '../types';

interface TaskCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ todo, onToggle, onDelete }) => {
  const isDone = todo.status === TodoStatus.DONE;

  return (
    <div 
      className={`group flex items-center justify-between p-4 mb-3 rounded-2xl border transition-all duration-300 ${
        isDone 
          ? 'bg-slate-50 border-slate-200' 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100'
      }`}
    >
      <div className="flex items-center space-x-4 flex-1">
        <button
          onClick={() => onToggle(todo.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
            isDone 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'bg-white border-slate-300 hover:border-indigo-400'
          }`}
        >
          {isDone && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        <div className="flex flex-col">
          <span className={`text-base font-medium transition-all duration-300 ${
            isDone ? 'text-slate-400 line-through' : 'text-slate-800'
          }`}>
            {todo.title}
          </span>
          <span className="text-xs text-slate-400 font-normal mt-0.5">
            Added on {todo.createdAt}
          </span>
        </div>
      </div>

      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 transition-all duration-200 rounded-lg hover:bg-rose-50"
        aria-label="Delete task"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};
