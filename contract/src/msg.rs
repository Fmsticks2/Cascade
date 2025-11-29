use linera_sdk::base::Owner;
use async_graphql::Enum;
use serde::{Deserialize, Serialize};

/// Initialization argument for the application
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstantiationArgument {
    /// The admin who can resolve markets
    pub admin: Owner,
}

/// Market category classification
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Enum)]
pub enum MarketCategory {
    Crypto,
    Politics,
    Economics,
    Tech,
    Sports,
    Other,
}

/// Operations that can be performed on the contract (Write operations)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Operation {
    /// Create a new prediction market
    CreateMarket {
        question: String,
        outcome_names: Vec<String>,
        expiry_time: u64,
        category: MarketCategory,
        /// Optional parent market ID for cascading markets
        parent_id: Option<String>,
    },
    
    /// Place a bet on a specific outcome
    PlaceBet {
        market_id: String,
        outcome_id: String,
        amount: u64,
    },
    
    /// Resolve a market with the winning outcome (Admin only)
    ResolveMarket {
        market_id: String,
        winning_outcome_id: String,
    },
    
    /// Claim winnings from a resolved market
    ClaimWinnings {
        market_id: String,
    },
}

/// Cross-chain messages for inter-application communication
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Message {
    /// Notify other chains about market resolution
    MarketResolved {
        market_id: String,
        winning_outcome_id: String,
    },
}
