
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Todo, TodoStatus } from './types';
import { TaskCard } from './components/TaskCard';
import { BottomNav } from './components/BottomNav';
import { TopBar } from './components/TopBar';
import { getTaskMotivation } from './services/aiService';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('zen_todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [aiMessage, setAiMessage] = useState('Welcome back, ready to focus?');
  const [isRefreshingAi, setIsRefreshingAi] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('zen_todos', JSON.stringify(todos));
  }, [todos]);

  // Fetch AI motivation on significant changes
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

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: inputValue.trim(),
      createdAt: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      status: TodoStatus.PENDING
    };

    setTodos(prev => [newTodo, ...prev]);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, status: t.status === TodoStatus.PENDING ? TodoStatus.DONE : TodoStatus.PENDING } : t
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'pending': return todos.filter(t => t.status === TodoStatus.PENDING);
      case 'done': return todos.filter(t => t.status === TodoStatus.DONE);
      default: return todos;
    }
  }, [todos, filter]);

  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter(t => t.status === TodoStatus.DONE).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, percent };
  }, [todos]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 pt-4 px-4">
      <div className="max-w-xl mx-auto">
        
        {/* New Utility Top Bar */}
        <TopBar />

        {/* Brand Header Section */}
        <header className="mb-8 flex items-center space-x-4 px-2">
          <div className="inline-flex items-center justify-center p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 animate-float text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">ZenDone</h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">Master your daily flow</p>
          </div>
        </header>

        {/* AI Insight Card */}
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
          </div>
        </div>

        {/* Input Section */}
        <form onSubmit={handleAddTask} className="mb-8 group">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a new task..."
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-6 pr-16 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 px-4 transition-all duration-200"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-200 disabled:shadow-none transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </form>

        {/* Filter Indicator */}
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {filter} ({filteredTodos.length})
          </h3>
        </div>

        {/* Task List */}
        <div className="space-y-1">
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <TaskCard 
                key={todo.id} 
                todo={todo} 
                onToggle={toggleTodo} 
                onDelete={deleteTodo} 
              />
            ))
          ) : (
            <div className="text-center py-16 bg-white/50 rounded-3xl border border-dashed border-slate-200">
              <div className="inline-flex p-4 rounded-full bg-slate-50 mb-4 text-slate-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-slate-400 font-medium">Clear for take-off!</p>
              <p className="text-slate-300 text-xs mt-1 italic">Switch views or add a task to begin.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
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

      {/* Bottom Navigation */}
      <BottomNav currentFilter={filter} setFilter={setFilter} />
    </div>
  );
};

export default App;
