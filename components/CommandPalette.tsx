
import React, { useEffect, useState, useRef } from 'react';
import { Search, Command, ArrowRight, Wallet, LayoutGrid, Plus, Hash } from 'lucide-react';
import { Market } from '../types';
import { useSound } from './SoundContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  markets: Market[];
  onNavigateMarket: (id: string) => void;
  onAction: (action: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, markets, onNavigateMarket, onAction }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playHover, playClick } = useSound();

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const actions = [
    { id: 'goto-explorer', label: 'Go to Explorer', icon: <LayoutGrid className="w-4 h-4" />, action: () => onAction('EXPLORER') },
    { id: 'goto-portfolio', label: 'View Portfolio', icon: <Wallet className="w-4 h-4" />, action: () => onAction('PORTFOLIO') },
    { id: 'create-market', label: 'Create New Market', icon: <Plus className="w-4 h-4" />, action: () => onAction('CREATE') },
  ];

  const filteredMarkets = markets.filter(m => 
    m.question.toLowerCase().includes(query.toLowerCase()) || 
    m.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const allItems = [
    ...actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase())),
    ...filteredMarkets.map(m => ({
        id: m.id,
        label: m.question,
        subLabel: m.category,
        icon: <Hash className="w-4 h-4 text-slate-500" />,
        action: () => onNavigateMarket(m.id)
    }))
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % allItems.length);
        playHover();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
        playHover();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allItems[selectedIndex]) {
            playClick();
            allItems[selectedIndex].action();
            onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allItems, selectedIndex, onClose, playHover, playClick]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh] px-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-3 border-b border-slate-800">
          <Command className="w-5 h-5 text-slate-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-slate-500"
            placeholder="Type a command or search markets..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
          />
          <div className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 font-mono">
              ESC
          </div>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto py-2">
            {allItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-500">
                    No results found.
                </div>
            ) : (
                <div className="px-2 space-y-0.5">
                    {allItems.map((item, idx) => (
                        <button
                            key={item.id}
                            onClick={() => { playClick(); item.action(); onClose(); }}
                            onMouseEnter={() => { if(selectedIndex !== idx) { setSelectedIndex(idx); playHover(); }}}
                            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors ${
                                idx === selectedIndex ? 'bg-cascade-600/10 text-cascade-50' : 'text-slate-400 hover:bg-slate-800/50'
                            }`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`${idx === selectedIndex ? 'text-cascade-400' : 'text-slate-500'}`}>
                                    {item.icon}
                                </div>
                                <div className="truncate">
                                    <div className={`text-sm font-medium truncate ${idx === selectedIndex ? 'text-white' : ''}`}>{item.label}</div>
                                    {(item as any).subLabel && <div className="text-xs text-slate-500">{(item as any).subLabel}</div>}
                                </div>
                            </div>
                            {idx === selectedIndex && <ArrowRight className="w-4 h-4 text-cascade-500 animate-pulse" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
        
        <div className="bg-slate-950/50 px-4 py-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
            <div className="flex gap-2">
                <span>Navigate <b className="text-slate-400">↑↓</b></span>
                <span>Select <b className="text-slate-400">↵</b></span>
            </div>
            <span>Cascade Protocol v1.0</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
