use linera_sdk::base::ContractRuntime;
use thiserror::Error;

/// Custom error types for the Cascade Protocol application
#[derive(Debug, Error)]
pub enum CascadeProtocolError {
    #[error("Market not found: {0}")]
    MarketNotFound(String),
    
    #[error("Market has already expired")]
    MarketExpired,
    
    #[error("Market is not in Active status")]
    MarketNotActive,
    
    #[error("Market is not in Resolved status")]
    MarketNotResolved,
    
    #[error("Outcome not found: {0}")]
    OutcomeNotFound(String),
    
    #[error("Insufficient funds: required {required}, available {available}")]
    InsufficientFunds { required: u64, available: u64 },
    
    #[error("Unauthorized: only admin can perform this operation")]
    Unauthorized,
    
    #[error("Bet already claimed")]
    AlreadyClaimed,
    
    #[error("Bet not found for this market")]
    BetNotFound,
    
    #[error("Invalid bet amount: must be greater than 0")]
    InvalidBetAmount,
    
    #[error("Invalid market: must have at least 2 outcomes")]
    InvalidOutcomeCount,
    
    #[error("Invalid expiry time: must be in the future")]
    InvalidExpiryTime,
    
    #[error("User did not bet on the winning outcome")]
    NotWinningOutcome,
    
    #[error("View error: {0}")]
    ViewError(#[from] linera_views::views::ViewError),
    
    #[error("BCS serialization error: {0}")]
    BcsError(#[from] bcs::Error),
    
    #[error(transparent)]
    RuntimeError(#[from] linera_sdk::contract::system_api::Error<ContractRuntime>),
}