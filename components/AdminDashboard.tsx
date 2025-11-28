
import React, { useState } from 'react';
import { ShieldCheck, Search, AlertCircle, CheckCircle2, DollarSign, Clock, Trophy } from 'lucide-react';
import { Market } from '../types';
import { lineraService } from '../services/lineraService';
import { useSound } from './SoundContext';
import { useToast } from './Toast';

interface AdminDashboardProps {
  markets: Market[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ markets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { playClick, playSuccess, playError } = useSound();
  const { addToast } = useToast();

  const filteredMarkets = markets.filter(m => 
    m.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeMarkets = markets.filter(m => m.status === 'Active').length;
  const resolvedMarkets = markets.filter(m => m.status === 'Resolved').length;
  const totalVolume = markets.reduce((acc, m) => acc + m.totalStaked, 0);

  const handleResolve = async (market: Market) => {
    if (!selectedWinnerId) {
        addToast("Please select a winning outcome", "error");
        return;
    }

    setIsProcessing(true);
    playClick();

    try {
        const distributed = await lineraService.resolveMarket(market.id, selectedWinnerId);
        playSuccess();
        addToast(`Market resolved successfully. Distributed $${distributed.toFixed(2)} to winners.`, "success");
        setResolvingId(null);
        setSelectedWinnerId('');
    } catch (e: any) {
        playError();
        addToast(e.message || "Failed to resolve market", "error");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <div className="bg-red-500/10 text-red-500 p-2 rounded-lg"><ShieldCheck className="w-6 h-6" /></div>
             <h1 className="text-2xl font-bold text-white">Admin Console</h1>
           </div>
           <p className="text-slate-400 text-sm">Manage protocol parameters, resolve markets, and oversee settlement.</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
             <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                 <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Active Markets</div>
                 <div className="text-xl font-mono text-white">{activeMarkets}</div>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                 <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Resolved</div>
                 <div className="text-xl font-mono text-white">{resolvedMarkets}</div>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                 <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Total Volume</div>
                 <div className="text-xl font-mono text-cascade-400">${(totalVolume/1000).toFixed(1)}k</div>
             </div>
        </div>
      </div>

      {/* Market Management List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between gap-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                  Market Registry <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{filteredMarkets.length}</span>
              </h3>
              <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                      type="text" 
                      placeholder="Search markets..." 
                      className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:ring-1 focus:ring-cascade-500 focus:outline-none w-full md:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>

          <div className="divide-y divide-slate-800/50">
              {filteredMarkets.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">No markets found</div>
              ) : (
                  filteredMarkets.map((market) => (
                      <div key={market.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                              {/* Market Info */}
                              <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                      <span className="font-mono text-[10px] text-slate-500">ID: {market.id}</span>
                                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                                          market.status === 'Active' ? 'bg-green-500/10 text-green-400' : 
                                          market.status === 'Resolved' ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-700 text-slate-400'
                                      }`}>
                                          {market.status}
                                      </span>
                                  </div>
                                  <h4 className="font-medium text-slate-200 line-clamp-1">{market.question}</h4>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Pool: ${(market.totalStaked).toLocaleString()}</span>
                                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Ends: {new Date(market.expiryTime).toLocaleDateString()}</span>
                                  </div>
                              </div>

                              {/* Actions / Outcomes */}
                              <div className="flex items-center gap-4">
                                  {market.status === 'Active' && resolvingId !== market.id && (
                                      <button 
                                        onClick={() => { setResolvingId(market.id); setSelectedWinnerId(market.outcomes[0].id); }}
                                        className="px-4 py-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border border-slate-700 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                                      >
                                          <ShieldCheck className="w-4 h-4" /> Resolve Market
                                      </button>
                                  )}

                                  {market.status === 'Resolved' && (
                                      <div className="px-4 py-2 bg-purple-500/5 border border-purple-500/20 rounded-lg flex items-center gap-2">
                                          <Trophy className="w-4 h-4 text-purple-400" />
                                          <div className="text-xs">
                                              <span className="text-purple-300 font-bold block">Winner: {market.outcomes.find(o => o.id === market.winningOutcomeId)?.name}</span>
                                              <span className="text-slate-500">Auto-distributed to winners</span>
                                          </div>
                                      </div>
                                  )}
                              </div>
                          </div>

                          {/* Resolution Panel */}
                          {resolvingId === market.id && (
                              <div className="mt-4 pt-4 border-t border-slate-800/50 bg-red-900/5 -mx-4 px-4 pb-4 animate-in slide-in-from-top-2">
                                  <div className="flex items-start gap-3 mb-4">
                                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                      <div>
                                          <h5 className="text-sm font-bold text-red-400">Confirm Resolution</h5>
                                          <p className="text-xs text-red-300/70 mt-1">
                                              This action is irreversible. Funds will be automatically distributed to all winning wallet addresses immediately.
                                          </p>
                                      </div>
                                  </div>

                                  <div className="space-y-3 mb-4">
                                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Winning Outcome</label>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {market.outcomes.map(outcome => (
                                              <button
                                                  key={outcome.id}
                                                  onClick={() => setSelectedWinnerId(outcome.id)}
                                                  className={`flex justify-between items-center p-3 rounded-lg border transition-all ${
                                                      selectedWinnerId === outcome.id 
                                                      ? 'bg-red-500/20 border-red-500 text-white' 
                                                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                                                  }`}
                                              >
                                                  <span className="font-medium">{outcome.name}</span>
                                                  {selectedWinnerId === outcome.id && <CheckCircle2 className="w-4 h-4 text-red-500" />}
                                              </button>
                                          ))}
                                      </div>
                                  </div>

                                  <div className="flex justify-end gap-3">
                                      <button 
                                          onClick={() => setResolvingId(null)}
                                          className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium"
                                      >
                                          Cancel
                                      </button>
                                      <button 
                                          onClick={() => handleResolve(market)}
                                          disabled={isProcessing}
                                          className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-red-900/20 flex items-center gap-2"
                                      >
                                          {isProcessing ? 'Processing...' : 'Confirm & Distribute Funds'}
                                      </button>
                                  </div>
                              </div>
                          )}
                      </div>
                  ))
              )}
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
