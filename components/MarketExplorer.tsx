
import React, { useEffect, useState } from 'react';
import { Market, MarketCategory } from '../types';
import { Search, TrendingUp, ArrowRight, LayoutGrid, Activity, Globe, Zap } from 'lucide-react';
import MarketCard from './MarketCard';
import { MarketSkeleton } from './Skeleton';

interface MarketExplorerProps {
  markets: Market[];
  isLoading: boolean;
  onNavigate: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  activeCategory: MarketCategory | 'All';
  setActiveCategory: (c: MarketCategory | 'All') => void;
  sortBy: 'Newest' | 'Volume' | 'Ending Soon';
  setSortBy: (s: 'Newest' | 'Volume' | 'Ending Soon') => void;
  playClick: () => void;
}

const MarketExplorer: React.FC<MarketExplorerProps> = ({ 
    markets, isLoading, onNavigate, 
    searchTerm, setSearchTerm, 
    activeCategory, setActiveCategory, 
    sortBy, setSortBy, playClick 
}) => {
  
  // Logic for Trending Market rotation
  const [trendingIndex, setTrendingIndex] = useState(0);

  // Filter out resolved or expired markets for trending section for better UX
  const activeMarkets = markets.filter(m => m.status === 'Active');
  
  // Sort by volume to find candidates for trending, take top 5
  const trendingCandidates = activeMarkets.length > 0 
    ? [...activeMarkets].sort((a, b) => b.totalStaked - a.totalStaked).slice(0, 5)
    : [];
  
  const featuredMarket = trendingCandidates.length > 0 
    ? trendingCandidates[trendingIndex % trendingCandidates.length] 
    : null;

  useEffect(() => {
    if (trendingCandidates.length > 1) {
        const interval = setInterval(() => {
            setTrendingIndex(prev => (prev + 1) % trendingCandidates.length);
        }, 30000); // 30 seconds
        return () => clearInterval(interval);
    }
  }, [trendingCandidates.length]);


  const categories = ['All', 'Crypto', 'Economics', 'Politics', 'Tech', 'Sports', 'Other'];

  return (
    <div className="space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 min-h-[400px] flex flex-col justify-center px-8 md:px-16 py-12 shadow-2xl">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                 <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-cascade-500/20 rounded-full blur-[100px] animate-pulse"></div>
                 <div className="absolute -bottom-[20%] -left-[10%] w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[80px]"></div>
                 {/* Grid Pattern */}
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-cascade-400 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur">
                    <Zap className="w-3 h-3" /> Live on Linera
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-[1.1]">
                    The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cascade-400 to-teal-200">Probability</span><br/> 
                    Engine for Future Events.
                </h1>
                <p className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
                    Trade on the outcome of global events in a decentralized, cascading market network. Where one prediction spawns another.
                </p>
                
                {/* Search Bar in Hero */}
                <div className="relative max-w-lg group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cascade-500 to-teal-500 rounded-xl opacity-20 blur transition-opacity group-hover:opacity-30"></div>
                    <div className="relative bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl p-2 flex items-center shadow-2xl">
                        <Search className="w-5 h-5 text-slate-500 ml-3" />
                        <input 
                            type="text" 
                            placeholder="Find a market (e.g., 'Bitcoin 2024')" 
                            className="bg-transparent border-none outline-none text-white px-4 py-2 w-full placeholder:text-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="hidden sm:flex text-[10px] text-slate-500 bg-slate-800 border border-slate-700 px-2 py-1 rounded font-mono mr-2">
                            ⌘K
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Stats Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center hover:border-slate-700 transition-colors cursor-default">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Total Volume</span>
                <span className="text-2xl font-mono text-white font-medium">$4.82M</span>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center hover:border-slate-700 transition-colors cursor-default">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Active Markets</span>
                <span className="text-2xl font-mono text-white font-medium">{markets.length}</span>
            </div>
             <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center hover:border-slate-700 transition-colors cursor-default">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">24h Trades</span>
                <span className="text-2xl font-mono text-cascade-400 font-medium">1,204</span>
            </div>
             <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center hover:border-slate-700 transition-colors cursor-default">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">TVL</span>
                <span className="text-2xl font-mono text-white font-medium">$892k</span>
            </div>
        </div>

        {/* Featured Section (Rotating Trending Market) */}
        {featuredMarket && !searchTerm && activeCategory === 'All' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700" key={featuredMarket.id}>
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cascade-400" />
                    <h2 className="text-xl font-bold text-white">Trending Now</h2>
                    <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Updating live
                    </span>
                </div>
                <div 
                    className="group relative bg-slate-900 border border-slate-800 hover:border-cascade-500/50 rounded-2xl p-8 transition-all cursor-pointer overflow-hidden"
                    onClick={() => onNavigate(featuredMarket.id)}
                >
                    <div className="absolute top-0 right-0 p-32 bg-cascade-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cascade-500/10 transition-colors"></div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex gap-2">
                                <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">Hot</span>
                                <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{featuredMarket.category}</span>
                            </div>
                            <h3 className="text-3xl font-bold text-white leading-tight group-hover:text-cascade-200 transition-colors">
                                {featuredMarket.question}
                            </h3>
                            <div className="flex items-center gap-6 text-sm text-slate-400">
                                <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> High Volatility</span>
                                <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Global Event</span>
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex flex-col gap-3 min-w-[250px]">
                            {featuredMarket.outcomes.slice(0, 2).map(outcome => (
                                <div key={outcome.id} className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center border border-slate-700">
                                    <span className="font-medium text-slate-200">{outcome.name}</span>
                                    <span className="text-cascade-400 font-mono font-bold">{outcome.odds}%</span>
                                </div>
                            ))}
                            <button className="mt-2 w-full py-3 bg-white text-slate-900 hover:bg-cascade-50 font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                                Trade Now <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
                {/* Dots indicator for rotation */}
                <div className="flex justify-center gap-2">
                    {trendingCandidates.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === (trendingIndex % trendingCandidates.length) ? 'bg-cascade-500 w-4' : 'bg-slate-800'}`}
                        ></div>
                    ))}
                </div>
            </div>
        )}

        {/* Filter Bar */}
        <div className="sticky top-16 z-20 bg-slate-950/80 backdrop-blur-xl py-4 border-b border-slate-800/50 -mx-4 px-4 md:mx-0 md:px-0 flex flex-col sm:flex-row justify-between gap-4 items-center">
             <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-hide">
                 {categories.map(cat => (
                     <button 
                        key={cat} 
                        onClick={() => { playClick(); setActiveCategory(cat as any); }} 
                        className={`px-4 py-1.5 text-xs font-medium rounded-full border whitespace-nowrap transition-all ${
                            activeCategory === cat 
                            ? 'bg-white text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
                        }`}
                    >
                        {cat}
                     </button>
                 ))}
             </div>
             
             <div className="flex items-center gap-3 w-full sm:w-auto">
                 <span className="text-xs text-slate-500 font-medium uppercase hidden md:block">Sort By</span>
                 <select 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value as any)} 
                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2 focus:ring-1 focus:ring-cascade-500 focus:outline-none w-full sm:w-auto cursor-pointer"
                >
                     <option value="Newest">Newest Added</option>
                     <option value="Volume">Highest Volume</option>
                     <option value="Ending Soon">Ending Soon</option>
                 </select>
             </div>
        </div>

        {/* Market Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
             {isLoading ? Array.from({length:6}).map((_, i) => <MarketSkeleton key={i} />) : 
              markets.length > 0 ? markets.map(m => <MarketCard key={m.id} market={m} onClick={(id) => { playClick(); onNavigate(id); }} />) : 
              <div className="col-span-full py-24 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                      <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No markets found</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your search terms or selecting a different category.</p>
              </div>
             }
         </div>
    </div>
  );
};

export default MarketExplorer;
