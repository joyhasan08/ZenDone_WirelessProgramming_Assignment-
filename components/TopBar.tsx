
import React, { useMemo, useRef } from 'react';

interface TopBarProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
  apiKeyInput: string;
  setApiKeyInput: (v: string) => void;
  exportData: () => void;
  importData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  stats: {
    total: number;
    done: number;
    pending: number;
    highPriority: number;
    overdue: number;
    percent: number;
  };
}

export const TopBar: React.FC<TopBarProps> = ({
  darkMode,
  setDarkMode,
  searchQuery,
  setSearchQuery,
  showSettings,
  setShowSettings,
  apiKeyInput,
  setApiKeyInput,
  exportData,
  importData,
  stats
}) => {
  const dateInfo = useMemo(() => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const hour = now.getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    if (hour >= 17) greeting = 'Good Evening';
    
    return { day, date, greeting };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4 px-2 py-4">
        <div className="flex flex-col">
          <span className={`text-xs font-bold uppercase tracking-widest mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {dateInfo.day}, {dateInfo.date}
          </span>
          <h2 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            {dateInfo.greeting}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-xl transition-all duration-200 ${darkMode ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-white text-slate-600 hover:bg-slate-100'} shadow-sm`}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-xl transition-all duration-200 ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-600 hover:bg-slate-100'} shadow-sm`}
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {showSettings && (
        <div className={`p-4 mb-4 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-700'}`}>Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Google AI API Key</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter your API key for AI features"
                className={`w-full px-3 py-2 rounded-lg text-sm border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'} focus:outline-none focus:border-indigo-500`}
              />
              <p className={`text-[10px] mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Get key from ai.google.dev</p>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Search Tasks</label>
              <div className="relative">
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search... (Ctrl+F)"
                  className={`w-full px-3 py-2 pl-9 rounded-lg text-sm border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'} focus:outline-none focus:border-indigo-500`}
                />
                <svg className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Data Management</label>
              <div className="flex gap-2">
                <button
                  onClick={exportData}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Export JSON
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Import JSON
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Keyboard Shortcuts</label>
              <div className={`text-xs space-y-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <p><kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600">Ctrl+N</kbd> New task</p>
                <p><kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600">Ctrl+D</kbd> Toggle dark mode</p>
                <p><kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600">Ctrl+F</kbd> Search</p>
                <p><kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600">Ctrl+Z</kbd> Undo delete</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showSettings && (
        <div className={`relative mx-2 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm`}>
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks... (Ctrl+F)"
            className={`w-full px-4 py-3 pl-10 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-slate-800 text-white placeholder:text-slate-500' : 'bg-white text-slate-700 placeholder:text-slate-400'}`}
          />
          <svg className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
