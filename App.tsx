
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Todo, TodoStatus, Category, Priority, Subtask, CATEGORIES, PRIORITIES, DeletedTodo } from './types';
import { TaskCard } from './components/TaskCard';
import { BottomNav } from './components/BottomNav';
import { TopBar } from './components/TopBar';
import { getTaskMotivation, getSmartSuggestions, autoCategorize, getPriorityFromAI, getProductivityInsights } from './services/aiService';

const UNDO_TIMEOUT = 5000;

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('zen_todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [aiMessage, setAiMessage] = useState('Welcome back, ready to focus?');
  const [isRefreshingAi, setIsRefreshingAi] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('zen_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [deletedTodo, setDeletedTodo] = useState<DeletedTodo | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('personal');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('zen_ai_api_key') || '');
  const [draggedItem, setDraggedItem] = useState<Todo | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('zen_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('zen_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    if (apiKeyInput) {
      localStorage.setItem('zen_ai_api_key', apiKeyInput);
    }
  }, [apiKeyInput]);

  const refreshMotivation = useCallback(async () => {
    setIsRefreshingAi(true);
    const completed = todos.filter(t => t.status === TodoStatus.DONE).length;
    const msg = await getTaskMotivation(todos.length, completed);
    setAiMessage(msg);
    setIsRefreshingAi(false);
  }, [todos.length, todos.filter(t => t.status === TodoStatus.DONE).length]);

  useEffect(() => {
    refreshMotivation();
  }, [refreshMotivation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setDarkMode(prev => !prev);
      }
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        setShowSettings(false);
        setSearchQuery('');
      }
      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && deletedTodo) {
        e.preventDefault();
        handleUndoDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deletedTodo]);

  const handleAddTask = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    let category: Category = selectedCategory;
    let priority: Priority = selectedPriority;

    if (apiKeyInput) {
      category = await autoCategorize(inputValue.trim());
      priority = await getPriorityFromAI(inputValue.trim());
    }

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: inputValue.trim(),
      createdAt: new Date().toISOString(),
      status: TodoStatus.PENDING,
      dueDate: undefined,
      priority,
      category,
      subtasks: [],
      order: todos.length
    };

    setTodos(prev => [newTodo, ...prev]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, status: t.status === TodoStatus.PENDING ? TodoStatus.DONE : TodoStatus.PENDING } : t
    ));
  };

  const deleteTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setDeletedTodo({ todo, timestamp: Date.now() });
      setTodos(prev => prev.filter(t => t.id !== id));
      setTimeout(() => setDeletedTodo(null), UNDO_TIMEOUT);
    }
  };

  const handleUndoDelete = useCallback(() => {
    if (deletedTodo) {
      setTodos(prev => [deletedTodo.todo, ...prev]);
      setDeletedTodo(null);
    }
  }, [deletedTodo]);

  const handleAddSubtask = (taskId: string, title: string) => {
    setTodos(prev => prev.map(t => {
      if (t.id === taskId) {
        const newSubtask: Subtask = { id: crypto.randomUUID(), title, completed: false };
        return { ...t, subtasks: [...t.subtasks, newSubtask] };
      }
      return t;
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTodos(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
        };
      }
      return t;
    }));
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTodos(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) };
      }
      return t;
    }));
  };

  const updateDueDate = (id: string, dueDate: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, dueDate } : t));
  };

  const updatePriority = (id: string, priority: Priority) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, priority } : t));
  };

  const updateCategory = (id: string, category: Category) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, category } : t));
  };

  const handleDragStart = (todo: Todo) => {
    setDraggedItem(todo);
  };

  const handleDragOver = (e: React.DragEvent, targetTodo: Todo) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetTodo.id) return;

    const newTodos = [...todos];
    const draggedIndex = newTodos.findIndex(t => t.id === draggedItem.id);
    const targetIndex = newTodos.findIndex(t => t.id === targetTodo.id);

    newTodos.splice(draggedIndex, 1);
    newTodos.splice(targetIndex, 0, draggedItem);

    setTodos(newTodos.map((t, i) => ({ ...t, order: i })));
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const loadSmartSuggestions = async () => {
    const suggestions = await getSmartSuggestions(todos);
    setSmartSuggestions(suggestions);
    setShowSuggestions(true);
  };

  const exportData = () => {
    const data = { todos, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zendone-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.todos && Array.isArray(data.todos)) {
          setTodos(data.todos);
        }
      } catch (err) {
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
  };

  const filteredTodos = useMemo(() => {
    let result = todos;
    if (filter === 'pending') result = result.filter(t => t.status === TodoStatus.PENDING);
    if (filter === 'done') result = result.filter(t => t.status === TodoStatus.DONE);
    if (searchQuery) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result.sort((a, b) => a.order - b.order);
  }, [todos, filter, searchQuery]);

  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter(t => t.status === TodoStatus.DONE).length;
    const pending = total - done;
    const highPriority = todos.filter(t => t.priority === 'high' && t.status === TodoStatus.PENDING).length;
    const overdue = todos.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status === TodoStatus.PENDING).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, pending, highPriority, overdue, percent };
  }, [todos]);

  const completedThisWeek = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return todos.filter(t => t.status === TodoStatus.DONE && new Date(t.createdAt) > weekAgo).length;
  }, [todos]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} pb-32 pt-4 px-4`}>
      <div className="max-w-xl mx-auto">
        <TopBar 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          apiKeyInput={apiKeyInput}
          setApiKeyInput={setApiKeyInput}
          exportData={exportData}
          importData={importData}
          stats={stats}
        />

        <header className="mb-8 flex items-center space-x-4 px-2">
          <div className="inline-flex items-center justify-center p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 animate-float text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>ZenDone</h1>
            <p className={`text-sm mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Master your daily flow</p>
          </div>
        </header>

        <div className="mb-8 p-6 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-white">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-3">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
              <h2 className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Smart Motivation</h2>
            </div>
            <p className={`text-white text-lg font-medium leading-tight ${isRefreshingAi ? 'opacity-50' : 'opacity-100'} transition-opacity duration-500`}>
              {aiMessage}
            </p>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex flex-col text-white">
                <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Progress</span>
                <span className="text-2xl font-bold">{stats.percent}%</span>
              </div>
              <div className="w-1/2 bg-indigo-900/30 h-2.5 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="bg-white h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                  style={{ width: `${stats.percent}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-[10px] text-indigo-200">
              <span>Pending: {stats.pending}</span>
              <span>High Priority: {stats.highPriority}</span>
              <span>Overdue: {stats.overdue}</span>
            </div>
          </div>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('personal')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === 'personal' ? 'bg-purple-500 text-white' : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-600'}`}
          >
            Personal
          </button>
          <button
            onClick={() => setSelectedCategory('work')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === 'work' ? 'bg-blue-500 text-white' : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-600'}`}
          >
            Work
          </button>
          <button
            onClick={() => setSelectedCategory('shopping')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === 'shopping' ? 'bg-orange-500 text-white' : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-600'}`}
          >
            Shopping
          </button>
          <button
            onClick={() => setSelectedCategory('health')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === 'health' ? 'bg-green-500 text-white' : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-600'}`}
          >
            Health
          </button>
          <button
            onClick={() => setSelectedCategory('learning')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === 'learning' ? 'bg-yellow-500 text-white' : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-600'}`}
          >
            Learning
          </button>
        </div>

        <form onSubmit={handleAddTask} className="mb-8 group">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a new task... (Ctrl+N)"
              className={`w-full border-2 rounded-2xl py-4 pl-6 pr-36 text-base placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 px-4 transition-all duration-200 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-700'}`}
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={loadSmartSuggestions}
                className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
                title="AI Suggestions"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-200 disabled:shadow-none transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
        </form>

        {showSuggestions && smartSuggestions.length > 0 && (
          <div className={`mb-4 p-4 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-700'}`}>AI Suggestions</h3>
              <button onClick={() => setShowSuggestions(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {smartSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => { setInputValue(suggestion); setShowSuggestions(false); inputRef.current?.focus(); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-indigo-50 text-slate-600'}`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {deletedTodo && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-3 animate-pulse">
            <span>Task deleted</span>
            <button onClick={handleUndoDelete} className="text-indigo-300 hover:text-white font-medium">
              Undo (Ctrl+Z)
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
            {filter} ({filteredTodos.length})
          </h3>
          <div className="flex gap-2">
            {PRIORITIES.map(p => (
              <button
                key={p.value}
                onClick={() => setSelectedPriority(p.value)}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${selectedPriority === p.value ? p.bgColor + ' ' + p.color : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <TaskCard 
                key={todo.id} 
                todo={todo} 
                darkMode={darkMode}
                onToggle={toggleTodo} 
                onDelete={deleteTodo}
                onUpdateDueDate={updateDueDate}
                onUpdatePriority={updatePriority}
                onUpdateCategory={updateCategory}
                onAddSubtask={handleAddSubtask}
                onToggleSubtask={toggleSubtask}
                onDeleteSubtask={deleteSubtask}
                isExpanded={expandedTaskId === todo.id}
                onToggleExpand={() => setExpandedTaskId(expandedTaskId === todo.id ? null : todo.id)}
                onDragStart={() => handleDragStart(todo)}
                onDragOver={(e) => handleDragOver(e, todo)}
                onDragEnd={handleDragEnd}
                isDragging={draggedItem?.id === todo.id}
              />
            ))
          ) : (
            <div className={`text-center py-16 rounded-3xl border-2 border-dashed ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white/50'}`}>
              <div className={`inline-flex p-4 rounded-full mb-4 ${darkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-50 text-slate-300'}`}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Clear for take-off!</p>
              <p className={`text-xs mt-1 italic ${darkMode ? 'text-slate-500' : 'text-slate-300'}`}>Switch views or add a task to begin.</p>
            </div>
          )}
        </div>

        {todos.length > 0 && (
          <footer className="mt-8 text-center border-t border-slate-100 pt-6">
             <button 
              onClick={() => { if(window.confirm('Wipe the board clean?')) setTodos([]); }}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-rose-400 transition-colors duration-200"
            >
              Reset All Tasks
            </button>
          </footer>
        )}
      </div>

      <BottomNav currentFilter={filter} setFilter={setFilter} darkMode={darkMode} />
    </div>
  );
};

export default App;
