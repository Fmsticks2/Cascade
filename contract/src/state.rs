use async_graphql::{Object, SimpleObject};
use linera_sdk::base::Owner;
use linera_views::{
    common::Context,
    map_view::MapView,
    register_view::RegisterView,
    views::{RootView, View, ViewError},
};
use serde::{Deserialize, Serialize};

use crate::msg::MarketCategory;

/// Market status enumeration
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, SimpleObject)]
#[graphql(name = "MarketStatus")]
pub enum MarketStatus {
    Active,
    Resolved,
    Expired,
}

/// Represents a single outcome in a market
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[graphql(name = "Outcome")]
pub struct Outcome {
    pub id: String,
    pub name: String,
    pub total_staked: u64,
}

/// Represents a prediction market
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[graphql(name = "Market")]
pub struct Market {
    pub id: String,
    pub question: String,
    pub outcomes: Vec<Outcome>,
    pub total_staked: u64,
    pub status: MarketStatus,
    pub expiry_time: u64,
    pub winning_outcome_id: Option<String>,
    pub parent_id: Option<String>,
    pub category: MarketCategory,
}

impl Market {
    /// Calculate odds for display (odds = total_staked / outcome_staked)
    pub fn calculate_odds(&self, outcome_id: &str) -> f64 {
        if let Some(outcome) = self.outcomes.iter().find(|o| o.id == outcome_id) {
            if outcome.total_staked == 0 {
                return 0.0;
            }
            self.total_staked as f64 / outcome.total_staked as f64
        } else {
            0.0
        }
    }
}

/// Represents a bet placed by a user
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[graphql(name = "Bet")]
pub struct Bet {
    pub id: String,
    pub owner: Owner,
    pub market_id: String,
    pub outcome_id: String,
    pub amount: u64,
    pub claimed: bool,
}

/// Root application state
#[derive(RootView)]
#[view(context = "ViewStorageContext")]
pub struct CascadeProtocol<C> {
    /// Admin account that can resolve markets
    pub admin: RegisterView<C, Owner>,
    
    /// Counter for generating unique IDs
    pub id_counter: RegisterView<C, u64>,
    
    /// All markets indexed by market ID
    pub markets: MapView<C, String, Market>,
    
    /// All bets indexed by owner, then by bet ID
    pub bets_by_owner: MapView<C, Owner, Vec<Bet>>,
    
    /// All bets indexed by market ID for efficient lookups
    pub bets_by_market: MapView<C, String, Vec<Bet>>,
}

#[Object]
impl<C: Context + Send + Sync + Clone + 'static> CascadeProtocol<C>
where
    ViewError: From<C::Error>,
{
    /// Get all markets
    async fn markets(&self) -> Result<Vec<Market>, ViewError> {
        let mut result = Vec::new();
        self.markets.for_each_index_value(|_, market| {
            result.push(market.clone());
            Ok(())
        }).await?;
        Ok(result)
    }
    
    /// Get a specific market by ID
    async fn market(&self, id: String) -> Result<Option<Market>, ViewError> {
        self.markets.get(&id).await
    }
    
    /// Get all bets for a specific owner
    async fn bets_for_owner(&self, owner: Owner) -> Result<Vec<Bet>, ViewError> {
        match self.bets_by_owner.get(&owner).await? {
            Some(bets) => Ok(bets),
            None => Ok(Vec::new()),
        }
    }
    
    /// Get all bets for a specific market
    async fn bets_for_market(&self, market_id: String) -> Result<Vec<Bet>, ViewError> {
        match self.bets_by_market.get(&market_id).await? {
            Some(bets) => Ok(bets),
            None => Ok(Vec::new()),
        }
    }
    
    /// Get the current admin
    async fn admin(&self) -> Result<Owner, ViewError> {
        self.admin.get().await
    }
}

impl<C> CascadeProtocol<C>
where
    C: Context + Send + Sync + Clone,
    ViewError: From<C::Error>,
{
    /// Generate a new unique ID
    pub async fn generate_id(&mut self) -> Result<String, ViewError> {
        let current = self.id_counter.get().await;
        let next = current + 1;
        self.id_counter.set(next);
        Ok(format!("id_{}", next))
    }
    
    /// Add a market to storage
    pub async fn add_market(&mut self, market: Market) -> Result<(), ViewError> {
        self.markets.insert(&market.id, market)?;
        Ok(())
    }
    
    /// Update an existing market
    pub async fn update_market(&mut self, market: Market) -> Result<(), ViewError> {
        self.markets.insert(&market.id, market)?;
        Ok(())
    }
    
    /// Add a bet to storage
    pub async fn add_bet(&mut self, bet: Bet) -> Result<(), ViewError> {
        // Add to owner's bets
        let mut owner_bets = self.bets_by_owner.get(&bet.owner).await?.unwrap_or_default();
        owner_bets.push(bet.clone());
        self.bets_by_owner.insert(&bet.owner, owner_bets)?;
        
        // Add to market's bets
        let mut market_bets = self.bets_by_market.get(&bet.market_id).await?.unwrap_or_default();
        market_bets.push(bet.clone());
        self.bets_by_market.insert(&bet.market_id, market_bets)?;
        
        Ok(())
    }
    
    /// Update a bet (e.g., mark as claimed)
    pub async fn update_bet(&mut self, bet: Bet) -> Result<(), ViewError> {
        // Update in owner's bets
        if let Some(mut owner_bets) = self.bets_by_owner.get(&bet.owner).await? {
            if let Some(pos) = owner_bets.iter().position(|b| b.id == bet.id) {
                owner_bets[pos] = bet.clone();
                self.bets_by_owner.insert(&bet.owner, owner_bets)?;
            }
        }
        
        // Update in market's bets
        if let Some(mut market_bets) = self.bets_by_market.get(&bet.market_id).await? {
            if let Some(pos) = market_bets.iter().position(|b| b.id == bet.id) {
                market_bets[pos] = bet.clone();
                self.bets_by_market.insert(&bet.market_id, market_bets)?;
            }
        }
        
        Ok(())
    }
}