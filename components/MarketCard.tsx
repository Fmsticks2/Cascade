import React from 'react';
import { Clock, Network, ArrowRight, Trophy } from 'lucide-react';
import { Market } from '../types';

interface MarketCardProps {
  market: Market;
  onClick: (id: string) => void;
}

const MarketCard: React.FC<MarketCardProps> = ({ market, onClick }) => {
  const timeLeft = Math.max(0, market.expiryTime - Date.now());
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const isExpired = timeLeft <= 0 || market.status === 'Resolved';
  const isResolved = market.status === 'Resolved';

  return (
    <div 
      onClick={() => onClick(market.id)}
      className={`
        group relative overflow-hidden flex flex-col h-full
        rounded-xl p-5 transition-all duration-300 cursor-pointer backdrop-blur-sm
        ${isResolved 
            ? 'bg-slate-800/30 border border-slate-700/30' 
            : 'bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-cascade-500/50'
        }
      `}
    >
      {/* Background Gradient Hover Effect */}
      {!isResolved && (
        <div className="absolute inset-0 bg-gradient-to-br from-cascade-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      )}

      {/* Resolved Overlay Watermark */}
      {isResolved && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-slate-700/50 text-slate-700/50 text-6xl font-black uppercase tracking-widest pointer-events-none select-none p-4">
            RESOLVED
        </div>
      )}

      <div className={`relative z-10 flex flex-col h-full ${isResolved ? 'opacity-70' : ''}`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
              isResolved
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                : isExpired 
                    ? 'bg-slate-700/50 text-slate-400 border-slate-600' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {isResolved ? 'Resolved' : isExpired ? 'Ended' : 'Live'}
            </span>
             <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-700/50 text-slate-300 border border-slate-600">
               {market.category}
             </span>
          </div>
          <div className="flex items-center text-slate-400 text-xs gap-1">
             <Clock className="w-3 h-3" />
             <span>{daysLeft > 0 ? `${daysLeft}d left` : 'Ending soon'}</span>
          </div>
        </div>

        {/* Question */}
        <h3 className="text-lg font-semibold text-slate-100 mb-4 line-clamp-2 leading-tight group-hover:text-cascade-200 transition-colors">
          {market.question}
        </h3>

        {/* Top Outcome Bar */}
        <div className="mb-4 space-y-3 flex-grow">
            {market.outcomes.slice(0, 2).map((outcome) => {
                const isWinner = isResolved && market.winningOutcomeId === outcome.id;
                return (
                <div key={outcome.id} className="relative">
                    <div className="flex justify-between text-xs mb-1">
                        <span className={`font-medium flex items-center gap-1 ${isWinner ? 'text-yellow-400' : 'text-slate-300'}`}>
                            {outcome.name}
                            {isWinner && <Trophy className="w-3 h-3" />}
                        </span>
                        <span className={`${isWinner ? 'text-yellow-400 font-bold' : 'text-cascade-300 font-mono'}`}>
                            {isResolved ? (isWinner ? '100%' : '0%') : `${outcome.odds}%`}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                                isWinner ? 'bg-yellow-500' : 'bg-gradient-to-r from-cascade-600 to-teal-500'
                            }`}
                            style={{ width: `${isResolved ? (isWinner ? 100 : 0) : outcome.odds}%` }}
                        ></div>
                    </div>
                </div>
            )})}
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/30 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Volume</span>
            <span className="text-sm font-mono text-slate-300">${(market.totalStaked / 1000).toFixed(1)}k</span>
          </div>
          
          <div className="flex items-center gap-3">
             {market.childMarketIds.length > 0 && (
               <div className="flex items-center gap-1 text-[10px] text-cascade-400 bg-cascade-500/10 px-2 py-1 rounded-full">
                 <Network className="w-3 h-3" />
                 {market.childMarketIds.length}
               </div>
            )}
            {!isResolved && (
                <button className="flex items-center gap-1 text-xs font-medium text-cascade-400 group-hover:text-cascade-300 transition-colors">
                    Trade <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
            )}
            {isResolved && (
                <span className="text-xs text-slate-500">View Results</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketCard;