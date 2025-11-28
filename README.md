
# Cascade Protocol

![Cascade Protocol](https://via.placeholder.com/1200x400/0f172a/2dd4bf?text=CASCADE+PROTOCOL)

**Cascade Protocol** is a next-generation, AI-enhanced prediction market platform designed to visualize and interact with the complex causality of future events. Unlike traditional flat prediction markets, Cascade markets allow for the dynamic spawning of conditional sub-markets ("Child Markets"), creating an evolving tree-like network of interrelated predictions.

Built with performance and user experience at its core, Cascade offers instant trade execution, deep market topology visualization, and a seamless interface for navigating the probability landscape of tomorrow.

## 🌟 Key Features

### 🕸️ Dynamic Market Topology
- **Tree Visualization**: View markets not just as isolated events, but as connected nodes in a decision tree using our custom D3.js integration.
- **Recursive Markets**: Markets can spawn sub-markets based on specific outcomes (e.g., *IF "Bitcoin hits $100k" THEN "Will altcoins rise >50%?"*).

### ⚡ Real-Time Trading Engine
- **Instant Execution**: Optimistic UI updates ensure a snappy trading experience.
- **Live Odds**: Market probabilities update in real-time based on simulated liquidity and trading volume.
- **Activity Feeds**: Watch the network evolve as users place bets across the protocol.

### 🎨 Modern, Responsive UX
- **Cascade Theme**: A bespoke Teal/Cyan dark mode aesthetic designed for long trading sessions.
- **Mobile-First**: Fully responsive layout that works seamlessly on desktop, tablet, and mobile.
- **Accessible Design**: High contrast ratios, clear focus states, and screen-reader friendly structure.

### 💼 Portfolio Management
- **Wallet Integration**: Mock integration with Linera microchain wallets.
- **Performance Tracking**: Track active bets, history, and claim winnings from resolved markets.
- **Profit/Loss Analysis**: Real-time calculation of potential payouts.

### 🛡️ Admin & Governance (God Mode)
- **Admin Dashboard**: A comprehensive console for protocol administrators to manage markets.
- **Market Resolution**: Force-resolve markets by selecting winning outcomes based on oracle data.
- **Auto-Distribution**: Automatically calculate and distribute winnings to all eligible wallets immediately upon resolution.
- **God Mode HUD**: View raw system metrics like TPS, Block Height, and Peer status in real-time.

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS (Utility-first architecture)
- **Visualization**: D3.js (Force-directed trees and hierarchy graphs)
- **Icons**: Lucide React
- **State Management**: React Context & Hooks
- **Build Tool**: Vite
- **Blockchain Mock**: Custom service layer simulating Linera SDK interactions

## 🚀 Getting Started

To run this project locally:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/cascade-protocol.git
    cd cascade-protocol
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Open your browser**
    Navigate to `http://localhost:5173` to launch the application.

## 📂 Project Structure

```text
/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── MarketTree.tsx  # D3 Visualization logic
│   │   ├── MarketCard.tsx  # Individual market display
│   │   ├── BetForm.tsx     # Betting interface
│   │   ├── AdminDashboard.tsx # Admin control panel
│   │   └── ...
│   ├── services/           # Backend/Blockchain integration layers
│   │   └── lineraService.ts # Mock Linera SDK implementation
│   ├── types.ts            # TypeScript definitions (Market, Bet, User)
│   └── App.tsx             # Main application entry and routing
├── index.html              # HTML entry point & Tailwind config
└── metadata.json           # Application metadata
```

## 🧪 Demo Mode & Mock Data

This version of Cascade Protocol runs in **Demo Mode**. 
- The `lineraService.ts` simulates blockchain latency, transaction confirmations, and wallet persistence using `localStorage`.
- **Admin Access**: Enable "God Mode" in the Settings page to reveal the Admin Console button in the navigation bar.

## 🔮 Future Roadmap

- [ ] **Linera Mainnet Integration**: Replace mock service with actual Linera SDK.
- [ ] **AI Oracle Agents**: Automated market resolution and question generation.
- [ ] **Social Features**: Leaderboards and copying high-performing traders.
- [ ] **Advanced Graph Tools**: Zoom, pan, and filter the market tree complexity.

---

© 2024 Cascade Protocol. All rights reserved.
