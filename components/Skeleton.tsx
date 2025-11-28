import React from 'react';

export const MarketSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 h-[280px] animate-pulse relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <div className="h-5 bg-slate-700/50 rounded w-16"></div>
        <div className="h-4 bg-slate-700/50 rounded w-20"></div>
      </div>
      
      {/* Question */}
      <div className="space-y-2 mb-6">
        <div className="h-6 bg-slate-700/50 rounded w-full"></div>
        <div className="h-6 bg-slate-700/50 rounded w-2/3"></div>
      </div>
      
      {/* Bars */}
      <div className="space-y-4 mb-auto">
         <div className="space-y-1">
            <div className="flex justify-between">
                <div className="h-3 bg-slate-700/50 rounded w-12"></div>
                <div className="h-3 bg-slate-700/50 rounded w-8"></div>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full w-full"></div>
         </div>
         <div className="space-y-1">
            <div className="flex justify-between">
                <div className="h-3 bg-slate-700/50 rounded w-12"></div>
                <div className="h-3 bg-slate-700/50 rounded w-8"></div>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full w-full"></div>
         </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between pt-4 border-t border-slate-700/30">
          <div className="space-y-1">
              <div className="h-3 bg-slate-700/50 rounded w-10"></div>
              <div className="h-4 bg-slate-700/50 rounded w-16"></div>
          </div>
          <div className="h-6 bg-slate-700/50 rounded w-16 self-end"></div>
      </div>
    </div>
  );
};

export const PortfolioSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 relative overflow-hidden animate-pulse">
        <div className="flex justify-between items-start mb-2">
            <div className="h-3 bg-slate-700 rounded w-20"></div>
            <div className="h-4 bg-slate-700 rounded w-12"></div>
        </div>
        <div className="h-5 bg-slate-700 rounded w-3/4 mb-4"></div>
        <div className="flex justify-between items-end mt-4">
            <div className="space-y-1">
                <div className="h-3 bg-slate-700 rounded w-12"></div>
                <div className="h-5 bg-slate-700 rounded w-16"></div>
            </div>
            <div className="space-y-1 text-right">
                <div className="h-3 bg-slate-700 rounded w-20 ml-auto"></div>
                <div className="h-5 bg-slate-700 rounded w-24 ml-auto"></div>
            </div>
        </div>
    </div>
  );
};