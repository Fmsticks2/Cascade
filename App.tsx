
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutGrid, 
  Workflow,
  Menu,
  X,
  Command,
  Settings as SettingsIcon,
  Activity,
  Bell,
  Trash2,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import WalletConnector from './components/WalletConnector';
import MarketTree from './components/MarketTree';
import BetForm from './components/BetForm';
import CreateMarketForm from './components/CreateMarketForm';
import OddsChart from './components/OddsChart';
import CommandPalette from './components/CommandPalette';
import AIAnalyst from './components/AIAnalyst';
import Leaderboard from './components/Leaderboard';
import Settings from './components/Settings';
import MarketExplorer from './components/MarketExplorer';
import AdminDashboard from './components/AdminDashboard';
import { ToastProvider, useToast } from './components/Toast';
import { SoundProvider, useSound } from './components/SoundContext';
import { SettingsProvider, useSettings } from './components/SettingsContext';
import { lineraService } from './services/lineraService';
import { User, Market, ViewState, MarketCategory } from './types';

function CascadeApp() {
  const [user, setUser] = useState<User | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [view, setView] = useState<ViewState>('EXPLORER');
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [isMarketsLoading, setIsMarketsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Market Explorer State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<MarketCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<'Newest' | 'Volume' | 'Ending Soon'>('Newest');
  
  const [portfolioFilter, setPortfolioFilter] = useState<'Active' | 'History'>('Active');
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const { addToast, notifications, markAllAsRead, clearAll, unreadCount } = useToast();
  const { playClick, playSuccess, playError } = useSound();
  const { godMode } = useSettings();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initApp = async () => {
        const persistedUser = await lineraService.checkPersistedWallet();
        if (persistedUser) setUser(persistedUser);
        await loadMarkets();
        setIsMarketsLoading(false);
    };
    initApp();
    return lineraService.subscribe((updated) => {
        setMarkets(updated);
        lineraService.checkPersistedWallet().then(u => u && setUser(u));
    });
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close notifications on click outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
              setIsNotifOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMarkets = async () => setMarkets(await lineraService.getAllMarkets());
  
  const handleConnectWallet = async () => {
    setIsWalletLoading(true);
    playClick();
    try {
      const userData = await lineraService.connectWallet();
      setUser(userData);
      playSuccess();
      addToast('Wallet connected successfully', 'success');
    } catch { 
        playError(); 
        addToast('Connection failed', 'error'); 
    } 
    finally { setIsWalletLoading(false); }
  };

  const handleDisconnect = async () => {
    await lineraService.disconnectWallet();
    setUser(null);
    playClick();
    addToast('Wallet disconnected', 'info');
  };

  const handlePlaceBet = async (outcomeId: string, amount: number) => {
    if (!selectedMarketId) return;
    try {
        await lineraService.placeBet(selectedMarketId, outcomeId, amount);
        playSuccess();
        addToast('Bet confirmed on chain', 'success');
    } catch (e: any) { 
        playError();
        addToast(e.message, 'error'); 
    }
  };

  const handleCreateMarket = async (data: any) => {
      try {
        await lineraService.createMarket(data.question, data.outcomes, data.expiry, data.initialLiquidity, data.category, data.parentId);
        playSuccess();
        addToast('Market created successfully', 'success');
        setView('EXPLORER');
      } catch { 
        playError();
        addToast('Creation failed', 'error'); 
      }
  };

  const handleClaimWinnings = async (betId: string) => {
      try {
          const amt = await lineraService.claimWinnings(betId);
          playSuccess();
          addToast(`Claimed $${amt.toFixed(2)} winnings`, 'success');
      } catch (e: any) { 
          playError();
          addToast(e.message, 'error'); 
      }
  };

  const navigateToMarket = (id: string) => { 
      setSelectedMarketId(id); 
      setView('MARKET_DETAIL'); 
      window.scrollTo(0,0); 
  };

  // Helper logic for rendering...
  const filteredMarkets = markets.filter(m => 
      (activeCategory === 'All' || m.category === activeCategory) && 
      m.question.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
      if (sortBy === 'Volume') return b.totalStaked - a.totalStaked;
      if (sortBy === 'Ending Soon') return a.expiryTime - b.expiryTime;
      return b.createdAt - a.createdAt;
  });

  const getFilteredBets = () => {
      if (!user) return [];
      if (portfolioFilter === 'Active') {
          return user.bets.filter(b => b.status === 'Pending' || b.status === 'Confirmed');
      }
      return user.bets.filter(b => b.status === 'Won' || b.status === 'Lost');
  };

  const renderContent = () => {
      if (view === 'CREATE') return <CreateMarketForm parentMarket={selectedMarketId ? markets.find(m => m.id === selectedMarketId) : undefined} onSubmit={handleCreateMarket} onCancel={() => setView('EXPLORER')} />;
      
      if (view === 'LEADERBOARD') return <Leaderboard />;

      if (view === 'SETTINGS') return <Settings />;

      if (view === 'ADMIN') return <AdminDashboard markets={markets} />;

      if (view === 'PORTFOLIO') {
          if (!user) return (
             <div className="text-center py-20 animate-in fade-in">
                 <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LayoutGrid className="w-8 h-8 text-slate-500" />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Connect Wallet</h3>
                 <p className="text-slate-400 mb-6">Connect your Linera wallet to view your betting portfolio.</p>
                 <button onClick={handleConnectWallet} className="px-6 py-2 bg-cascade-600 hover:bg-cascade-500 text-white rounded-lg font-medium transition-colors">
                     Connect Now
                 </button>
             </div>
          );
          
          const displayBets = getFilteredBets();

          return (
             <div className="space-y-6 animate-in fade-in">
                 <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Portfolio</h2>
                    <div className="bg-slate-900 p-1 rounded-lg flex gap-1 border border-slate-800">
                        <button 
                            onClick={() => { playClick(); setPortfolioFilter('Active'); }}
                            className={`px-4 py-1.5 text-sm rounded-md transition-all font-medium ${portfolioFilter === 'Active' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                        >
                            Active
                        </button>
                        <button 
                            onClick={() => { playClick(); setPortfolioFilter('History'); }}
                            className={`px-4 py-1.5 text-sm rounded-md transition-all font-medium ${portfolioFilter === 'History' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                        >
                            History
                        </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayBets.length === 0 ? 
                        <div className="col-span-full text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                            <div className="text-slate-500">No {portfolioFilter.toLowerCase()} bets found.</div>
                        </div> 
                    : displayBets.map(bet => {
                        const market = markets.find(m => m.id === bet.marketId);
                        const outcome = market?.outcomes.find(o => o.id === bet.outcomeId);
                        const isWin = bet.status === 'Won';
                        return (
                            <div key={bet.id} className={`bg-slate-900 p-5 rounded-xl border ${isWin ? 'border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-slate-800'}`}>
                                <div className="flex justify-between mb-2 text-xs text-slate-400">
                                    <span>{new Date(bet.timestamp).toLocaleDateString()}</span>
                                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                                        isWin ? 'bg-green-500/10 text-green-400' : 
                                        bet.status === 'Lost' ? 'bg-red-500/10 text-red-400' : 
                                        'bg-blue-500/10 text-blue-400'
                                    }`}>{bet.status}</span>
                                </div>
                                <h3 className="font-medium text-slate-200 mb-3 truncate cursor-pointer hover:text-cascade-400 transition-colors" onClick={() => navigateToMarket(bet.marketId)}>{market?.question}</h3>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Outcome</span>
                                    <span className="text-white">{outcome?.name}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-4">
                                    <span className="text-slate-500">Payout</span>
                                    <span className="text-white font-mono">${bet.potentialPayout.toFixed(0)}</span>
                                </div>
                                {isWin && !bet.claimed && (
                                    <button onClick={() => handleClaimWinnings(bet.id)} className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-green-900/20">Claim Winnings</button>
                                )}
                                {bet.claimed && <div className="text-center text-xs text-green-500 py-2 bg-green-500/10 rounded font-medium border border-green-500/20">Claimed (Auto)</div>}
                            </div>
                        )
                    })}
                 </div>
             </div>
          );
      }

      if (view === 'MARKET_DETAIL' && selectedMarketId) {
          const market = markets.find(m => m.id === selectedMarketId);
          if (!market) return <div>Not found</div>;
          const isResolved = market.status === 'Resolved';
          return (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                  <button onClick={() => { playClick(); setView('EXPLORER'); }} className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1 group">
                      <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Explorer
                  </button>
                  <div className="grid lg:grid-cols-3 gap-8">
                      {/* Left Column (Info & Charts) */}
                      <div className="lg:col-span-2 space-y-8">
                          <div>
                              <div className="flex gap-2 mb-3">
                                  <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs font-bold uppercase">{market.category}</span>
                                  {isResolved && <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-bold uppercase">Resolved</span>}
                              </div>
                              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{market.question}</h1>
                              <div className="flex gap-6 text-slate-400 text-sm border-b border-slate-700 pb-6">
                                  <span className="text-white font-mono flex items-center gap-2"><Activity className="w-4 h-4 text-cascade-500"/> ${market.totalStaked.toLocaleString()} Vol</span>
                                  <span>Ends: {new Date(market.expiryTime).toLocaleDateString()}</span>
                              </div>
                          </div>
                          
                          {/* Odds Chart */}
                          <OddsChart market={market} />

                          {/* AI Analyst */}
                          <AIAnalyst market={market} />

                          {/* Graph */}
                          <div>
                              <h3 className="text-sm font-medium text-slate-400 uppercase mb-3 tracking-wider">Market Topology</h3>
                              <MarketTree markets={markets} currentMarketId={market.id} onNodeClick={navigateToMarket} />
                          </div>
                      </div>

                      {/* Right Column (Betting & Actions) */}
                      <div className="space-y-6">
                          {!isResolved ? <BetForm market={market} user={user} onPlaceBet={handlePlaceBet} /> : (
                              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 text-center shadow-lg">
                                  <div className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">Market Resolved</div>
                                  <h3 className="text-xl font-bold text-white">Winner Decided</h3>
                                  <p className="text-slate-300 mt-2">Outcome: <span className="text-purple-300 font-bold">{market.outcomes.find(o => o.id === market.winningOutcomeId)?.name}</span></p>
                              </div>
                          )}
                          
                          {/* Spawn Child Market CTA */}
                          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                               <div className="absolute inset-0 bg-cascade-500/5 group-hover:bg-cascade-500/10 transition-colors"></div>
                              <h4 className="text-white font-medium mb-1 relative">Create Derivative Market</h4>
                              <p className="text-xs text-slate-400 mb-4 relative">Spawn a conditional market linked to this event's outcome.</p>
                              <button onClick={() => { playClick(); setView('CREATE'); }} className="w-full relative py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm transition-colors border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-2">
                                  <Workflow className="w-4 h-4" /> Spawn Sub-Market
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          );
      }

      // Default Explorer View
      return (
        <div className="animate-in fade-in">
            <MarketExplorer 
                markets={filteredMarkets}
                isLoading={isMarketsLoading}
                onNavigate={(id) => { playClick(); navigateToMarket(id); }}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
                playClick={playClick}
            />
        </div>
      );
  };

  return (
      <>
        <CommandPalette 
            isOpen={isCmdOpen} 
            onClose={() => setIsCmdOpen(false)} 
            markets={markets}
            onNavigateMarket={navigateToMarket}
            onAction={(action) => {
                if (action === 'EXPLORER') setView('EXPLORER');
                if (action === 'PORTFOLIO') setView('PORTFOLIO');
                if (action === 'CREATE') { setSelectedMarketId(null); setView('CREATE'); }
            }}
        />
        <nav className="fixed top-0 w-full h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 z-50 px-4 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
            <div onClick={() => { playClick(); setView('EXPLORER'); }} className="flex items-center gap-2 cursor-pointer group">
                <div className="w-8 h-8 bg-gradient-to-br from-cascade-500 to-teal-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-cascade-500/20 transition-all">
                    <Workflow className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white tracking-tight group-hover:text-cascade-100 transition-colors">CASCADE</span>
            </div>
            
            <div className="hidden md:flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800/50">
                {['EXPLORER', 'LEADERBOARD', 'PORTFOLIO'].map((v) => (
                    <button 
                        key={v}
                        onClick={() => { playClick(); setView(v as ViewState); }} 
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${view === v ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50' : 'text-slate-400 hover:text-white'}`}
                    >
                        {v === 'EXPLORER' ? 'Markets' : v.charAt(0) + v.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center text-slate-500 text-xs bg-slate-900 px-2 py-1.5 rounded-md border border-slate-800 cursor-pointer hover:text-white transition-colors hover:border-slate-700" onClick={() => setIsCmdOpen(true)}>
                    <Command className="w-3 h-3 mr-1.5" /> Cmd+K
                </div>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => { playClick(); setIsNotifOpen(!isNotifOpen); if(!isNotifOpen) markAllAsRead(); }} 
                        className={`p-2 rounded-lg transition-colors relative ${isNotifOpen ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                    >
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
                        )}
                    </button>
                    {isNotifOpen && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 origin-top-right z-50">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/30">
                                <h3 className="text-xs font-bold text-white">Notifications</h3>
                                {notifications.length > 0 && (
                                    <button onClick={clearAll} className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1">
                                        <Trash2 className="w-3 h-3" /> Clear
                                    </button>
                                )}
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="py-8 text-center text-slate-500 text-xs">No notifications</div>
                                ) : (
                                    <div className="divide-y divide-slate-800/50">
                                        {notifications.map(n => (
                                            <div key={n.id} className="px-4 py-3 hover:bg-slate-800/30 transition-colors">
                                                <div className="flex gap-3">
                                                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                                    <div>
                                                        <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                                                        <p className="text-[10px] text-slate-600 mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* God Mode / Settings Buttons */}
                <button onClick={() => { playClick(); setView('SETTINGS'); }} className={`p-2 rounded-lg transition-colors ${view === 'SETTINGS' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                    <SettingsIcon className="w-4 h-4" />
                </button>
                
                {/* Admin Button (Visible in God Mode or Default for Demo) */}
                {godMode && (
                    <button 
                        onClick={() => { playClick(); setView('ADMIN'); }} 
                        className={`p-2 rounded-lg transition-colors border border-red-500/20 ${view === 'ADMIN' ? 'bg-red-900/20 text-red-400' : 'text-slate-500 hover:text-red-400 hover:bg-red-900/10'}`}
                        title="Admin Console"
                    >
                        <ShieldCheck className="w-4 h-4" />
                    </button>
                )}
                
                <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>
                
                <WalletConnector user={user} onConnect={handleConnectWallet} onDisconnect={handleDisconnect} isLoading={isWalletLoading} />
                
                <button className="md:hidden text-slate-400 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
            </div>
        </nav>
        
        {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur pt-24 px-6 space-y-4 md:hidden animate-in slide-in-from-right">
                <button onClick={() => { setView('EXPLORER'); setMobileMenuOpen(false); }} className="block w-full text-left py-4 text-xl font-medium text-slate-200 border-b border-slate-800">Markets</button>
                <button onClick={() => { setView('LEADERBOARD'); setMobileMenuOpen(false); }} className="block w-full text-left py-4 text-xl font-medium text-slate-200 border-b border-slate-800">Leaderboard</button>
                <button onClick={() => { setView('PORTFOLIO'); setMobileMenuOpen(false); }} className="block w-full text-left py-4 text-xl font-medium text-slate-200 border-b border-slate-800">Portfolio</button>
                <button onClick={() => { setView('SETTINGS'); setMobileMenuOpen(false); }} className="block w-full text-left py-4 text-xl font-medium text-slate-200 border-b border-slate-800">Settings</button>
                {godMode && <button onClick={() => { setView('ADMIN'); setMobileMenuOpen(false); }} className="block w-full text-left py-4 text-xl font-medium text-red-400 border-b border-slate-800">Admin Console</button>}
            </div>
        )}

        <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto min-h-[calc(100vh-140px)]">
            {renderContent()}
        </main>
        
        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-12">
             <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center border border-slate-800">
                        <Workflow className="w-3 h-3 text-slate-500" />
                    </div>
                    <span className="text-slate-500 font-bold tracking-tight">CASCADE</span>
                 </div>
                 <div className="text-slate-600 text-sm">
                     &copy; 2024 Cascade Protocol. Built on Linera.
                 </div>
             </div>
        </footer>

        {/* God Mode HUD */}
        {godMode && (
             <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-cascade-900/50 p-1 px-4 z-50 text-[10px] font-mono text-cascade-500/70 flex justify-between items-center pointer-events-none select-none">
                 <div className="flex gap-6">
                     <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> SYSTEM_ONLINE</span>
                     <span>TPS: 1,402</span>
                     <span>LATENCY: 12ms</span>
                     <span>PEERS: 84</span>
                     <span>BLOCK: #8,921,044</span>
                 </div>
                 <div className="uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                     <Activity className="w-3 h-3" /> Cascade Protocol God Mode
                 </div>
             </div>
        )}
      </>
  );
}

function App() {
  return (
    <SettingsProvider>
        <ToastProvider>
           <SoundProvider>
                <div className="min-h-screen font-sans selection:bg-cascade-500/30 bg-[#020617] text-slate-50">
                    <CascadeApp />
                </div>
           </SoundProvider>
        </ToastProvider>
    </SettingsProvider>
  );
}

export default App;
