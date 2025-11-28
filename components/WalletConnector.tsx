
import React, { useState } from 'react';
import { Wallet, LogOut, Loader2, Download, ExternalLink } from 'lucide-react';
import { User } from '../types';

interface WalletConnectorProps {
  user: User | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  isLoading: boolean;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({ user, onConnect, onDisconnect, isLoading }) => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const handleConnectClick = async () => {
      try {
          // Check for injection (MetaMask/Ethereum) before calling service
          if (typeof window.ethereum === 'undefined') {
              setShowInstallPrompt(true);
              return;
          }
          await onConnect();
      } catch (e: any) {
          if (e.message && e.message.includes('not found')) {
              setShowInstallPrompt(true);
          } else {
              console.error(e);
          }
      }
  };

  if (showInstallPrompt) {
      return (
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg shadow-lg shadow-orange-900/20 transition-all duration-200 animate-pulse"
          >
              <Download className="w-4 h-4" />
              <span className="font-medium">Install MetaMask</span>
              <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
          </a>
      );
  }

  if (isLoading) {
    return (
      <button className="flex items-center gap-2 bg-slate-800 text-slate-400 px-4 py-2 rounded-lg border border-slate-700 cursor-wait opacity-80">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Connecting...</span>
      </button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-1.5 rounded-lg border border-slate-700/50 backdrop-blur-sm">
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-400">Balance</span>
          <span className="text-sm font-mono font-medium text-cascade-400">${user.balance.toFixed(2)}</span>
        </div>
        <div className="h-8 w-px bg-slate-700 mx-1"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-orange-900/20">
            {user.address.substring(0, 2)}
          </div>
          <span className="text-sm font-medium text-slate-200 hidden sm:block">
              {user.address.length > 10 ? `${user.address.substring(0, 6)}...${user.address.substring(user.address.length - 4)}` : user.address}
          </span>
          <button 
            onClick={onDisconnect}
            className="ml-2 p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-md transition-colors"
            title="Disconnect"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnectClick}
      className="group relative flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-black/30 transition-all duration-200 active:scale-95 border border-slate-600/50"
    >
      <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-5 h-5" />
      <span className="font-medium">Connect MetaMask</span>
      <div className="absolute inset-0 rounded-lg ring-2 ring-white/10 group-hover:ring-white/20 transition-all"></div>
    </button>
  );
};

export default WalletConnector;
