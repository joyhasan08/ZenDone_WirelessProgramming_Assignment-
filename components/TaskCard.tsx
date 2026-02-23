
import React, { useState } from 'react';
import { Todo, TodoStatus, Category, Priority, CATEGORIES, PRIORITIES, Subtask } from '../types';

interface TaskCardProps {
  todo: Todo;
  darkMode: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateDueDate: (id: string, dueDate: string) => void;
  onUpdatePriority: (id: string, priority: Priority) => void;
  onUpdateCategory: (id: string, category: Category) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  todo,
  darkMode,
  onToggle,
  onDelete,
  onUpdateDueDate,
  onUpdatePriority,
  onUpdateCategory,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  isExpanded,
  onToggleExpand,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging
}) => {
  const isDone = todo.status === TodoStatus.DONE;
  const [newSubtask, setNewSubtask] = useState('');
  const categoryData = CATEGORIES.find(c => c.value === todo.category);
  const priorityData = PRIORITIES.find(p => p.value === todo.priority);

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !isDone;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtask.trim()) {
      onAddSubtask(todo.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const completedSubtasks = todo.subtasks.filter(s => s.completed).length;

  return (
    <div 
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`group mb-3 rounded-2xl border transition-all duration-300 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${
        isDone 
          ? darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
          : darkMode ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100'
      } ${isOverdue ? 'border-rose-300' : ''}`}
    >
      <div className="flex items-start justify-between p-4">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <button
            onClick={() => onToggle(todo.id)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 mt-0.5 flex-shrink-0 ${
              isDone 
                ? 'bg-emerald-500 border-emerald-500 text-white' 
                : darkMode ? 'bg-slate-700 border-slate-600 hover:border-indigo-400' : 'bg-white border-slate-300 hover:border-indigo-400'
            }`}
          >
            {isDone && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-base font-medium transition-all duration-300 truncate ${
                isDone 
                  ? darkMode ? 'text-slate-500 line-through' : 'text-slate-400 line-through'
                  : darkMode ? 'text-white' : 'text-slate-800'
              }`}>
                {todo.title}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryData?.color} text-white`}>
                {categoryData?.label}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${priorityData?.bgColor} ${priorityData?.color}`}>
                {priorityData?.label}
              </span>
              {isOverdue && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-600">
                  Overdue
                </span>
              )}
            </div>
            
            <div className={`text-xs flex items-center gap-3 flex-wrap ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
              <span>Added {new Date(todo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              {todo.dueDate && (
                <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-500' : ''}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Due {new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
              {todo.subtasks.length > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {completedSubtasks}/{todo.subtasks.length}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={onToggleExpand}
            className={`p-2 transition-colors rounded-lg ${darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className={`p-2 transition-all duration-200 rounded-lg ${darkMode ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-700' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
            aria-label="Delete task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={`px-4 pb-4 pt-0 space-y-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="pt-4">
            <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Due Date</label>
            <input
              type="date"
              value={todo.dueDate || ''}
              onChange={(e) => onUpdateDueDate(todo.id, e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:border-indigo-500`}
            />
          </div>

          <div>
            <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  onClick={() => onUpdatePriority(todo.id, p.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    todo.priority === p.value 
                      ? p.bgColor + ' ' + p.color 
                      : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => onUpdateCategory(todo.id, c.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    todo.category === c.value 
                      ? c.color + ' text-white' 
                      : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Subtasks ({completedSubtasks}/{todo.subtasks.length})
            </label>
            <div className="space-y-2">
              {todo.subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center gap-2 group/sub">
                  <button
                    onClick={() => onToggleSubtask(todo.id, subtask.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      subtask.completed 
                        ? 'bg-indigo-500 border-indigo-500 text-white' 
                        : darkMode ? 'border-slate-600' : 'border-slate-300'
                    }`}
                  >
                    {subtask.completed && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </button>
                  <span className={`flex-1 text-sm ${subtask.completed ? 'line-through ' + (darkMode ? 'text-slate-500' : 'text-slate-400') : darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => onDeleteSubtask(todo.id, subtask.id)}
                    className="opacity-0 group-hover/sub:opacity-100 text-slate-400 hover:text-rose-500 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add subtask..."
                  className={`flex-1 px-3 py-2 rounded-lg text-sm border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'} focus:outline-none focus:border-indigo-500`}
                />
                <button
                  type="submit"
                  disabled={!newSubtask.trim()}
                  className="px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
