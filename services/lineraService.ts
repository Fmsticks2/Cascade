
import { Market, Bet, User, Outcome, MarketCategory, HistoryPoint, LeaderboardEntry } from '../types';

// Helper to generate mock history
const generateHistory = (outcomes: Outcome[], createdAt: number): HistoryPoint[] => {
  const points: HistoryPoint[] = [];
  const now = Date.now();
  const steps = 20;
  const interval = (now - createdAt) / steps;

  let currentOdds = outcomes.map(o => ({ id: o.id, val: o.odds }));

  for (let i = 0; i <= steps; i++) {
    const timestamp = createdAt + (i * interval);
    
    // Wiggle odds slightly, ensuring sum is roughly 100 (simplified)
    if (i > 0) {
        currentOdds = currentOdds.map(o => ({
            id: o.id,
            val: Math.max(1, Math.min(99, o.val + (Math.random() * 10 - 5)))
        }));
    }

    const point: HistoryPoint = {
        timestamp,
        outcomeOdds: {}
    };
    currentOdds.forEach(o => point.outcomeOdds[o.id] = o.val);
    points.push(point);
  }
  return points;
};

// Mock Data
const MOCK_MARKETS: Market[] = [
  // CRYPTO
  {
    id: 'm-1',
    question: 'Will Bitcoin exceed $100k by end of 2024?',
    description: 'This market resolves to "Yes" if the price of Bitcoin (BTC) on CoinGecko exceeds $100,000.00 USD at any point before December 31, 2024, 11:59 PM UTC.',
    rules: 'Price data will be sourced from the daily high on CoinGecko. If CoinGecko is unavailable, Binance spot price will be used.',
    resolutionSource: 'CoinGecko / Binance',
    category: 'Crypto',
    outcomes: [
      { id: 'o-1-a', name: 'Yes', odds: 65, totalStaked: 150000 },
      { id: 'o-1-b', name: 'No', odds: 35, totalStaked: 80000 },
    ],
    totalStaked: 230000,
    status: 'Active',
    expiryTime: new Date('2024-12-31').getTime(),
    childMarketIds: ['m-2', 'm-3'],
    createdAt: Date.now() - 10000000,
    priceHistory: []
  },
  {
    id: 'm-2',
    parentId: 'm-1',
    question: 'Will the SEC approve a new spot Crypto ETF in Q3 2024?',
    description: 'Predicts regulatory approval for any new spot crypto ETF (excluding BTC/ETH which are already approved).',
    rules: 'Resolves based on official SEC press releases or filings.',
    category: 'Crypto',
    outcomes: [
      { id: 'o-2-a', name: 'Approved', odds: 40, totalStaked: 45000 },
      { id: 'o-2-b', name: 'Denied/Delayed', odds: 60, totalStaked: 67000 },
    ],
    totalStaked: 112000,
    status: 'Active',
    expiryTime: new Date('2024-09-30').getTime(),
    childMarketIds: [],
    createdAt: Date.now() - 5000000,
    priceHistory: []
  },
  {
    id: 'm-10',
    question: 'Will Ethereum flippen Bitcoin market cap in 2025?',
    description: 'Resolves to Yes if Ethereum market capitalization exceeds Bitcoin market capitalization for 24 continuous hours.',
    category: 'Crypto',
    outcomes: [
      { id: 'o-10-a', name: 'Yes', odds: 15, totalStaked: 25000 },
      { id: 'o-10-b', name: 'No', odds: 85, totalStaked: 140000 },
    ],
    totalStaked: 165000,
    status: 'Active',
    expiryTime: new Date('2025-12-31').getTime(),
    childMarketIds: [],
    createdAt: Date.now() - 8000000,
    priceHistory: []
  },
  {
    id: 'm-11',
    question: 'Will Solana downtime exceed 48 hours total in 2024?',
    category: 'Crypto',
    outcomes: [
        { id: 'o-11-a', name: 'Yes', odds: 30, totalStaked: 12000 },
        { id: 'o-11-b', name: 'No', odds: 70, totalStaked: 28000 }
    ],
    totalStaked: 40000,
    status: 'Active',
    expiryTime: new Date('2024-12-31').getTime(),
    childMarketIds: [],
    createdAt: Date.now() - 3000000,
    priceHistory: []
  },

  // ECONOMICS
  {
    id: 'm-3',
    parentId: 'm-1',
    question: 'Will US Inflation (CPI) drop below 2.5% in 2024?',
    category: 'Economics',
    description: 'Tracks the Consumer Price Index (CPI) year-over-year change for any month in 2024.',
    outcomes: [
      { id: 'o-3-a', name: 'Yes', odds: 25, totalStaked: 12000 },
      { id: 'o-3-b', name: 'No', odds: 75, totalStaked: 36000 },
    ],
    totalStaked: 48000,
    status: 'Active',
    expiryTime: new Date('2024-12-31').getTime(),
    childMarketIds: ['m-4'],
    createdAt: Date.now() - 4000000,
    priceHistory: []
  },
  {
    id: 'm-4',
    parentId: 'm-3',
    question: 'Will the Fed cut rates in September 2024?',
    category: 'Economics',
    outcomes: [
      { id: 'o-4-a', name: 'Cut > 25bps', odds: 15, totalStaked: 5000 },
      { id: 'o-4-b', name: 'Cut 25bps', odds: 50, totalStaked: 15000 },
      { id: 'o-4-c', name: 'No Cut', odds: 35, totalStaked: 10000 },
    ],
    totalStaked: 30000,
    status: 'Active',
    expiryTime: new Date('2024-09-18').getTime(),
    childMarketIds: [],
    createdAt: Date.now() - 2000000,
    priceHistory: []
  },
  {
    id: 'm-12',
    question: 'Will Gold reach $3,000/oz before 2025?',
    category: 'Economics',
    outcomes: [
        { id: 'o-12-a', name: 'Yes', odds: 55, totalStaked: 85000 },
        { id: 'o-12-b', name: 'No', odds: 45, totalStaked: 70000 }
    ],
    totalStaked: 155000,
    status: 'Active',
    expiryTime: new Date('2024-12-31').getTime(),
    childMarketIds: [],
    createdAt: Date.now() - 6000000,
    priceHistory: []
  },

  // POLITICS
  {
    id: 'm-5',
    question: 'Who will win the 2024 US Presidential Election?',
    description: 'The winner of the 2024 US Presidential election as determined by the Electoral College.',
    category: 'Politics',
    outcomes: [
      { id: 'o-5-a', name: 'Democrat', odds: 48, totalStaked: 500000 },
      { id: 'o-5-b', name: 'Republican', odds: 52, totalStaked: 540000 },
    ],
    totalStaked: 1040000,
    status: 'Active',
    expiryTime: new Date('2024-11-05').getTime(),
    childMarketIds: [],
    createdAt: Date.now() - 20000000,
    priceHistory: []
  },
  {
    id: 'm-13',
    question: 'Will the UK rejoin the EU Single Market before 2030?',
    category: 'Politics',
    outcomes: [
        { id: 'o-13-a', name: 'Yes', odds: 12, totalStaked: 5000 },
        { id: 'o-13-b', name: 'No', odds: 88, totalStaked: 38000 }
    ],
    totalStaked: 43000,
    status: 'Active',
    expiryTime: new Date('2029-12-31').getTime(),
    childMarketIds: [],
    createdAt: Date.now() - 12000000,
    priceHistory: []
  },

  // TECH
  {
    id: 'm-6',
    question: 'Will OpenAI release GPT-5 before July 2024?',
    description: 'Official release of a model explicitly named GPT-5 or equivalent successor by OpenAI.',
    category: 'Tech',
    outcomes: [
      { id: 'o-6-a', name: 'Yes', odds: 22, totalStaked: 89000 },
      { id: 'o-6-b', name: 'No', odds: 78, totalStaked: 310000 },
    ],
    totalStaked: 399000,
    status: 'Active',
    expiryTime: new Date('2024-07-01').getTime(),
    childMarketIds: [],
    createdAt: Date.now() - 9000000,
    priceHistory: []
  },
  {
    id: 'm-7',
    question: 'Will Apple acquire a major EV manufacturer in 2024?',
    category: 'Tech',
    outcomes: [
        { id: 'o-7-a', name: 'Rivian', odds: 15, totalStaked: 20000 },
        { id: 'o-7-b', name: 'Lucid', odds: 8, totalStaked: 10000 },
        { id: 'o-7-c', name: 'None/Other', odds: 77, totalStaked: 95000 }
    ],
    totalStaked: 125000,
    status: 'Active',
    expiryTime: new Date('2024-12-31').getTime(),
    childMarketIds: [],
    createdAt: Date.now() - 4000000,
    priceHistory: []
  },
  {
    id: 'm-14',
    question: 'Will Starship successfully orbit & return in next launch?',
    category: 'Tech',
    outcomes: [
        { id: 'o-14-a', name: 'Success', odds: 60, totalStaked: 45000 },
        { id: 'o-14-b', name: 'Failure', odds: 40, totalStaked: 30000 }
    ],
    totalStaked: 75000,
    status: 'Active',
    expiryTime: new Date('2024-06-30').getTime(),
    childMarketIds: [],
    createdAt: Date.now() - 1000000,
    priceHistory: []
  },

  // SPORTS
  {
    id: 'm-8',
    question: 'Who will win the 2024 UEFA Champions League?',
    category: 'Sports',
    outcomes: [
        { id: 'o-8-a', name: 'Man City', odds: 35, totalStaked: 60000 },
        { id: 'o-8-b', name: 'Real Madrid', odds: 30, totalStaked: 55000 },
        { id: 'o-8-c', name: 'Arsenal', odds: 15, totalStaked: 25000 },
        { id: 'o-8-d', name: 'Bayern', odds: 20, totalStaked: 35000 }
    ],
    totalStaked: 175000,
    status: 'Active',
    expiryTime: new Date('2024-06-01').getTime(),
    childMarketIds: [],
    createdAt: Date.now() - 15000000,
    priceHistory: []
  },
  {
    id: 'm-9',
    question: 'Will LeBron James retire after the 2024 season?',
    category: 'Sports',
    outcomes: [
        { id: 'o-9-a', name: 'Yes', odds: 10, totalStaked: 8000 },
        { id: 'o-9-b', name: 'No', odds: 90, totalStaked: 72000 }
    ],
    totalStaked: 80000,
    status: 'Active',
    expiryTime: new Date('2024-07-01').getTime(),
    childMarketIds: [],
    createdAt: Date.now() - 2000000,
    priceHistory: []
  },
  {
    id: 'm-15',
    question: 'Max Verstappen to win every remaining race in 2024?',
    category: 'Sports',
    outcomes: [
        { id: 'o-15-a', name: 'Yes', odds: 5, totalStaked: 2000 },
        { id: 'o-15-b', name: 'No', odds: 95, totalStaked: 35000 }
    ],
    totalStaked: 37000,
    status: 'Active',
    expiryTime: new Date('2024-12-08').getTime(),
    childMarketIds: [],
    createdAt: Date.now() - 500000,
    priceHistory: []
  },

  // OTHER
  {
    id: 'm-16',
    question: 'Will Taylor Swift announce a new album in Q2?',
    category: 'Other',
    outcomes: [
        { id: 'o-16-a', name: 'Yes', odds: 80, totalStaked: 120000 },
        { id: 'o-16-b', name: 'No', odds: 20, totalStaked: 30000 }
    ],
    totalStaked: 150000,
    status: 'Active',
    expiryTime: new Date('2024-06-30').getTime(),
    childMarketIds: [],
    createdAt: Date.now() - 3000000,
    priceHistory: []
  }
];

// Hydrate history on load
MOCK_MARKETS.forEach(m => {
    m.priceHistory = generateHistory(m.outcomes, m.createdAt);
});

let currentUser: User | null = null;
type Listener = (markets: Market[]) => void;
let listeners: Listener[] = [];

const STORAGE_KEY = 'cascade_wallet_session_mm';

// Helper to notify all listeners
const notifyListeners = () => {
    listeners.forEach(listener => listener([...MOCK_MARKETS]));
};

// Simulate Real-time updates
setInterval(() => {
  if (Math.random() > 0.3) { // 70% chance to update tick
    const marketIndex = Math.floor(Math.random() * MOCK_MARKETS.length);
    const market = MOCK_MARKETS[marketIndex];
    
    if (market.status === 'Active' && market.outcomes.length >= 2) {
      // Fluctuate odds
      const outcomeIndex1 = Math.floor(Math.random() * market.outcomes.length);
      let outcomeIndex2 = Math.floor(Math.random() * market.outcomes.length);
      while (outcomeIndex2 === outcomeIndex1) {
        outcomeIndex2 = Math.floor(Math.random() * market.outcomes.length);
      }

      const fluctuation = Math.floor(Math.random() * 3) + 1; // 1-3% change
      
      // Ensure we don't go below 1 or above 99
      if (market.outcomes[outcomeIndex1].odds > fluctuation + 1 && market.outcomes[outcomeIndex2].odds + fluctuation < 99) {
          market.outcomes[outcomeIndex1].odds -= fluctuation;
          market.outcomes[outcomeIndex2].odds += fluctuation;
      }
      
      // Add some volume
      const volumeAdd = Math.floor(Math.random() * 1000);
      market.totalStaked += volumeAdd;
      market.outcomes[outcomeIndex1].totalStaked += volumeAdd;

      // Update history
      const newPoint: HistoryPoint = {
          timestamp: Date.now(),
          outcomeOdds: {}
      };
      market.outcomes.forEach(o => newPoint.outcomeOdds[o.id] = o.odds);
      market.priceHistory.push(newPoint);
      if (market.priceHistory.length > 50) market.priceHistory.shift(); // Keep history size manageable

      notifyListeners();
    }
  }
}, 2500);

export const lineraService = {
  subscribe: (listener: Listener) => {
    listeners.push(listener);
    // Return initial state immediately
    listener([...MOCK_MARKETS]);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  checkPersistedWallet: async (): Promise<User | null> => {
      // Logic: If user has a session stored, try to reconnect silently if the wallet is available
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
          try {
              // Check if wallet is actually available in window
              if (typeof window.ethereum !== 'undefined') {
                   // For now, assume session valid if stored and wallet exists
                   const parsed = JSON.parse(stored);
                   currentUser = parsed;
                   return currentUser;
              }
          } catch (e) {
              localStorage.removeItem(STORAGE_KEY);
          }
      }
      return null;
  },

  connectWallet: async (): Promise<User> => {
    // 1. Check if MetaMask/Ethereum Provider is injected
    if (typeof window.ethereum === 'undefined') {
        throw new Error("MetaMask not found");
    }

    try {
        // 2. Request Accounts using standard EIP-1193 pattern
        // This simulates using @linera/signer which uses MetaMask for signing
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (!accounts || accounts.length === 0) {
            throw new Error("No accounts found");
        }

        const address = accounts[0];

        // 3. Create User Session
        currentUser = {
            address: address,
            balance: 2500.00, // Mock initial balance for the demo
            bets: [],
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
        return currentUser;
    } catch (error: any) {
        console.error("Wallet connection failed:", error);
        if (error.code === 4001) {
             throw new Error("Connection rejected by user");
        }
        throw error;
    }
  },

  disconnectWallet: async (): Promise<void> => {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY);
  },

  getAllMarkets: async (): Promise<Market[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...MOCK_MARKETS];
  },

  getMarketById: async (id: string): Promise<Market | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_MARKETS.find((m) => m.id === id);
  },

  placeBet: async (marketId: string, outcomeId: string, amount: number): Promise<Bet> => {
    // In a real implementation, this would trigger a MetaMask signature for a Linera operation
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (!currentUser) throw new Error("Wallet not connected");
    if (currentUser.balance < amount) throw new Error("Insufficient balance");

    const market = MOCK_MARKETS.find(m => m.id === marketId);
    if (!market) throw new Error("Market not found");
    if (market.status !== 'Active') throw new Error("Market is not active");

    const outcome = market.outcomes.find(o => o.id === outcomeId);
    if (!outcome) throw new Error("Invalid outcome");

    // Simple fixed odds payout calculation for demo
    const multiplier = 100 / outcome.odds; 
    const potentialPayout = amount * multiplier;

    const newBet: Bet = {
      id: `bet-${Date.now()}`,
      marketId,
      outcomeId,
      amount,
      timestamp: Date.now(),
      potentialPayout,
      status: 'Confirmed',
      claimed: false
    };

    currentUser.balance -= amount;
    currentUser.bets.push(newBet);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    
    // Update market volume mock
    market.totalStaked += amount;
    outcome.totalStaked += amount;

    notifyListeners();

    return newBet;
  },

  createMarket: async (question: string, outcomeNames: string[], expiry: number, initialLiquidity: number, category: MarketCategory, parentId?: string): Promise<Market> => {
     await new Promise((resolve) => setTimeout(resolve, 1500));
     
     const newId = `m-${Date.now()}`;
     const outcomes: Outcome[] = outcomeNames.map((name, idx) => ({
         id: `o-${newId}-${idx}`,
         name,
         odds: 100 / outcomeNames.length, // Even split initially
         totalStaked: initialLiquidity / outcomeNames.length
     }));

     const newMarket: Market = {
         id: newId,
         question,
         outcomes,
         totalStaked: initialLiquidity,
         status: 'Active',
         expiryTime: expiry,
         childMarketIds: [],
         parentId,
         category,
         createdAt: Date.now(),
         priceHistory: generateHistory(outcomes, Date.now())
     };

     MOCK_MARKETS.push(newMarket);
     
     // If parent exists, update parent's children
     if (parentId) {
         const parent = MOCK_MARKETS.find(m => m.id === parentId);
         if (parent) {
             parent.childMarketIds.push(newId);
         }
     }
     
     notifyListeners();

     return newMarket;
  },

  // Admin/Oracle function simulation
  resolveMarket: async (marketId: string, winningOutcomeId: string): Promise<number> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const market = MOCK_MARKETS.find(m => m.id === marketId);
      if (!market) throw new Error("Market not found");
      
      market.status = 'Resolved';
      market.winningOutcomeId = winningOutcomeId;
      market.outcomes.forEach(o => {
          o.odds = o.id === winningOutcomeId ? 100 : 0;
      });

      let totalDistributed = 0;

      // Update local user bets status if connected and Auto-Distribute
      if (currentUser) {
          let userWinnings = 0;
          currentUser.bets.forEach(bet => {
              if (bet.marketId === marketId) {
                  const isWinner = bet.outcomeId === winningOutcomeId;
                  bet.status = isWinner ? 'Won' : 'Lost';
                  
                  if (isWinner && !bet.claimed) {
                      bet.claimed = true; // Auto-claim
                      userWinnings += bet.potentialPayout;
                  }
              }
          });
          
          if (userWinnings > 0) {
              currentUser.balance += userWinnings;
              totalDistributed += userWinnings;
          }
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      }

      notifyListeners();
      return totalDistributed;
  },

  claimWinnings: async (betId: string): Promise<number> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (!currentUser) throw new Error("Wallet not connected");
      const bet = currentUser.bets.find(b => b.id === betId);
      if (!bet) throw new Error("Bet not found");
      if (bet.status !== 'Won') throw new Error("Bet did not win");
      if (bet.claimed) throw new Error("Already claimed");

      bet.claimed = true;
      currentUser.balance += bet.potentialPayout;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      return bet.potentialPayout;
  },

  getAIAnalysis: async (market: Market): Promise<string> => {
     // Mocking an LLM response
     const templates = [
         `Based on current trading volume ($${(market.totalStaked/1000).toFixed(1)}k) and odds divergence, the market sentiment leans heavily towards ${market.outcomes[0].name}. Key risk factors include regulatory ambiguity in the ${market.category} sector and macroeconomic headwinds.`,
         `Volatility analysis detects a significant spike in contrarian betting on ${market.outcomes[1]?.name}. While ${market.outcomes[0]?.name} remains the favorite (${market.outcomes[0]?.odds}%), the liquidity depth suggests smart money is hedging against this outcome.`,
         `Algorithmic consensus: The probability spread between outcomes has narrowed by 5% in the last 24h. Recommend monitoring external news events regarding ${market.category} regulations. Historical data suggests a 15% margin of error for this timeframe.`
     ];
     return templates[Math.floor(Math.random() * templates.length)];
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
     await new Promise(resolve => setTimeout(resolve, 400));
     return [
         { rank: 1, address: '0x88A...2B19', totalProfit: 45200, winRate: 78, volume: 120000, badges: ['Whale', 'Oracle'] },
         { rank: 2, address: '0x32C...9A00', totalProfit: 32100, winRate: 64, volume: 89000, badges: ['Early Adopter'] },
         { rank: 3, address: '0x11B...CC44', totalProfit: 28500, winRate: 55, volume: 150000, badges: ['Volume King'] },
         { rank: 4, address: '0x77D...EE22', totalProfit: 19000, winRate: 82, volume: 45000, badges: ['Sharpshooter'] },
         { rank: 5, address: '0x99F...11AA', totalProfit: 12400, winRate: 49, volume: 90000, badges: [] },
     ];
  }
};
