
export type MarketStatus = 'Active' | 'Resolved' | 'Expired';

export type MarketCategory = 'Crypto' | 'Politics' | 'Economics' | 'Tech' | 'Sports' | 'Other';

export interface Outcome {
  id: string;
  name: string;
  odds: number; // percentage 0-100
  totalStaked: number;
}

export interface HistoryPoint {
  timestamp: number;
  outcomeOdds: Record<string, number>; // outcomeId -> odds
}

export interface Market {
  id: string;
  question: string;
  description?: string;
  rules?: string;
  resolutionSource?: string;
  outcomes: Outcome[];
  totalStaked: number;
  status: MarketStatus;
  expiryTime: number; // timestamp
  winningOutcomeId?: string;
  parentId?: string; // ID of the parent market
  childMarketIds: string[]; // IDs of spawned markets
  createdAt: number;
  category: MarketCategory;
  priceHistory: HistoryPoint[];
}

export interface Bet {
  id: string;
  marketId: string;
  outcomeId: string;
  amount: number;
  timestamp: number;
  potentialPayout: number;
  status: 'Pending' | 'Confirmed' | 'Won' | 'Lost';
  claimed: boolean;
}

export interface User {
  address: string;
  balance: number;
  bets: Bet[];
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  totalProfit: number;
  winRate: number;
  volume: number;
  badges: string[];
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
  read: boolean;
}

export type ViewState = 'EXPLORER' | 'CREATE' | 'PORTFOLIO' | 'MARKET_DETAIL' | 'LEADERBOARD' | 'SETTINGS' | 'ADMIN';

// Extend global Window to support MetaMask (Ethereum Provider)
// Linera transactions can be signed via MetaMask using @linera/signer logic
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}
