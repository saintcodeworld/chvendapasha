
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  subValue: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subValue, icon, highlight }) => {
  return (
    <div className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
      highlight 
        ? 'bg-purple-500/10 border-purple-500/30 shadow-[0_8px_30px_rgb(168,85,247,0.1)] text-white' 
        : 'bg-zinc-900/50 border-zinc-800 text-white'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${highlight ? 'bg-purple-500/20' : 'bg-zinc-800'}`}>
          {icon}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest">Live</div>
      </div>
      <div>
        <h3 className="text-white text-sm font-medium mb-1">{title}</h3>
        <div className="text-2xl font-bold tracking-tight mono text-white">{value}</div>
        <p className="text-white text-xs mt-1">{subValue}</p>
      </div>
    </div>
  );
};

export default StatsCard;
