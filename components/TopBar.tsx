
import React, { useMemo } from 'react';

export const TopBar: React.FC = () => {
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

  return (
    <div className="flex items-center justify-between mb-8 px-2 py-4">
      <div className="flex flex-col">
        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
          {dateInfo.day}, {dateInfo.date}
        </span>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          {dateInfo.greeting}
        </h2>
      </div>
      
      <div className="relative group cursor-pointer">
        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-105">
          <img 
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150" 
            alt="User avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
      </div>
    </div>
  );
};
