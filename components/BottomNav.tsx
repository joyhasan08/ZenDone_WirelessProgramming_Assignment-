
import React from 'react';

interface BottomNavProps {
  currentFilter: 'all' | 'pending' | 'done';
  setFilter: (filter: 'all' | 'pending' | 'done') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentFilter, setFilter }) => {
  const tabs = [
    {
      id: 'all' as const,
      label: 'All',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      id: 'pending' as const,
      label: 'Pending',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'done' as const,
      label: 'Done',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 pointer-events-none">
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-lg border border-slate-200 shadow-2xl rounded-3xl flex items-center justify-around p-2 pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = currentFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-300 relative ${
                isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-50' : 'bg-transparent'}`}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-bold uppercase mt-1 tracking-wider">{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 bg-indigo-600 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
