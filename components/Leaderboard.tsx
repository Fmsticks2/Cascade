
import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types';
import { lineraService } from '../services/lineraService';
import { Medal, Trophy, TrendingUp, Award } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lineraService.getLeaderboard().then(res => {
        setData(res);
        setLoading(false);
    });
  }, []);

  if (loading) {
      return (
          <div className="space-y-4 animate-pulse">
              <div className="h-12 bg-slate-800 rounded-lg"></div>
              {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-slate-800/50 rounded-lg"></div>)}
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/10">
              <Trophy className="w-6 h-6" />
          </div>
          <div>
              <h1 className="text-3xl font-bold text-white">Global Leaderboard</h1>
              <p className="text-slate-400">Top traders by realized profit this season.</p>
          </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-4">Trader</div>
              <div className="col-span-3 text-right">Profit</div>
              <div className="col-span-2 text-right">Win Rate</div>
              <div className="col-span-2 text-right">Volume</div>
          </div>
          
          <div className="divide-y divide-slate-800/50">
              {data.map((entry) => {
                  let rankColor = 'text-slate-400';
                  let bgClass = 'hover:bg-slate-800/30';
                  
                  if (entry.rank === 1) { rankColor = 'text-yellow-400'; bgClass = 'bg-yellow-500/5 hover:bg-yellow-500/10'; }
                  if (entry.rank === 2) { rankColor = 'text-slate-300'; bgClass = 'bg-slate-500/5 hover:bg-slate-500/10'; }
                  if (entry.rank === 3) { rankColor = 'text-amber-600'; bgClass = 'bg-amber-600/5 hover:bg-amber-600/10'; }

                  return (
                    <div key={entry.rank} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${bgClass}`}>
                        <div className={`col-span-1 flex justify-center`}>
                            {entry.rank <= 3 ? (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                    entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : 
                                    entry.rank === 2 ? 'bg-slate-400/20 text-slate-300' : 
                                    'bg-amber-700/20 text-amber-600'
                                }`}>
                                    {entry.rank}
                                </div>
                            ) : (
                                <span className="text-slate-500 font-mono text-lg">#{entry.rank}</span>
                            )}
                        </div>
                        
                        <div className="col-span-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs text-slate-400 font-mono border border-slate-700">
                                    {entry.address.substring(2,4)}
                                </div>
                                <div>
                                    <div className="font-mono text-white font-medium">{entry.address}</div>
                                    <div className="flex gap-1 mt-1">
                                        {entry.badges.map(b => (
                                            <span key={b} className="text-[10px] px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400 flex items-center gap-1">
                                                {b === 'Whale' && <Award className="w-2 h-2 text-blue-400" />}
                                                {b}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-3 text-right">
                            <span className="text-green-400 font-mono font-bold">+${entry.totalProfit.toLocaleString()}</span>
                        </div>

                        <div className="col-span-2 text-right">
                            <div className="inline-flex flex-col items-end">
                                <span className="text-white font-bold">{entry.winRate}%</span>
                                <div className="w-16 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-cascade-500" style={{ width: `${entry.winRate}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2 text-right">
                            <span className="text-slate-400 text-sm font-mono">${(entry.volume / 1000).toFixed(1)}k</span>
                        </div>
                    </div>
                  );
              })}
          </div>
      </div>
    </div>
  );
};

export default Leaderboard;
