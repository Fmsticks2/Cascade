use linera_sdk::{
    base::{Account, Amount, Owner, WithContractAbi},
    views::{RootView, View},
    Contract, ContractRuntime,
};

use crate::{
    error::CascadeProtocolError,
    msg::{InstantiationArgument, Message, Operation},
    state::{Bet, CascadeProtocol, Market, MarketStatus, Outcome},
};

/// The contract implementation for Cascade Protocol
pub struct CascadeProtocolContract {
    state: CascadeProtocol,
    runtime: ContractRuntime<CascadeProtocolContract>,
}

 

impl WithContractAbi for CascadeProtocolContract {
    type Abi = crate::CascadeProtocolAbi;
}

impl Contract for CascadeProtocolContract {
    type Message = Message;
    type Parameters = ();
    type InstantiationArgument = InstantiationArgument;

    async fn load(runtime: ContractRuntime<CascadeProtocolContract>) -> Self {
        let state = CascadeProtocol::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        CascadeProtocolContract { state, runtime }
    }

    async fn instantiate(&mut self, argument: InstantiationArgument) {
        // Set the admin
        self.state.admin.set(Some(argument.admin));
        
        // Initialize the ID counter
        self.state.id_counter.set(0);
    }

    async fn execute_operation(&mut self, operation: Operation) -> Self::Message {
        match operation {
            Operation::CreateMarket {
                question,
                outcome_names,
                expiry_time,
                category,
                parent_id,
            } => {
                self.create_market(question, outcome_names, expiry_time, category, parent_id)
                    .await
                    .expect("Failed to create market");
            }
            
            Operation::PlaceBet {
                market_id,
                outcome_id,
                amount,
            } => {
                self.place_bet(market_id, outcome_id, amount)
                    .await
                    .expect("Failed to place bet");
            }
            
            Operation::ResolveMarket {
                market_id,
                winning_outcome_id,
            } => {
                self.resolve_market(market_id, winning_outcome_id)
                    .await
                    .expect("Failed to resolve market");
            }
            
            Operation::ClaimWinnings { market_id } => {
                self.claim_winnings(market_id)
                    .await
                    .expect("Failed to claim winnings");
            }
        }
        
        // Return empty message by default
        Message::MarketResolved {
            market_id: String::new(),
            winning_outcome_id: String::new(),
        }
    }

    async fn execute_message(&mut self, message: Message) {
        // Handle cross-chain messages if needed in the future
        match message {
            Message::MarketResolved { .. } => {
                // Handle market resolution notification
            }
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl CascadeProtocolContract {
    /// Create a new prediction market
    async fn create_market(
        &mut self,
        question: String,
        outcome_names: Vec<String>,
        expiry_time: u64,
        category: crate::msg::MarketCategory,
        parent_id: Option<String>,
    ) -> Result<(), CascadeProtocolError> {
        // Validate outcome count
        if outcome_names.len() < 2 {
            return Err(CascadeProtocolError::InvalidOutcomeCount);
        }

        // Validate expiry time
        let current_time = self.runtime.system_time().micros();
        if expiry_time <= current_time {
            return Err(CascadeProtocolError::InvalidExpiryTime);
        }

        // Generate market ID
        let market_id = self.state.generate_id().await?;

        // Create outcomes
        let mut outcomes = Vec::new();
        for (idx, name) in outcome_names.into_iter().enumerate() {
            outcomes.push(Outcome {
                id: format!("{}_{}", market_id, idx),
                name,
                total_staked: 0,
            });
        }

        // Create market
        let market = Market {
            id: market_id.clone(),
            question,
            outcomes,
            total_staked: 0,
            status: MarketStatus::Active,
            expiry_time,
            winning_outcome_id: None,
            parent_id,
            category,
        };

        // Save market
        self.state.add_market(market).await?;

        Ok(())
    }

    /// Place a bet on a market outcome
    async fn place_bet(
        &mut self,
        market_id: String,
        outcome_id: String,
        amount: u64,
    ) -> Result<(), CascadeProtocolError> {
        // Validate amount
        if amount == 0 {
            return Err(CascadeProtocolError::InvalidBetAmount);
        }

        // Get the caller
        let caller = self.runtime
            .authenticated_signer()
            .ok_or(CascadeProtocolError::Unauthorized)?;

        // Load market
        let mut market = self
            .state
            .markets
            .get(&market_id)
            .await?
            .ok_or_else(|| CascadeProtocolError::MarketNotFound(market_id.clone()))?;

        // Check market status
        if market.status != MarketStatus::Active {
            return Err(CascadeProtocolError::MarketNotActive);
        }

        // Check expiry
        let current_time = self.runtime.system_time().micros();
        if current_time >= market.expiry_time {
            return Err(CascadeProtocolError::MarketExpired);
        }

        // Find and update outcome
        let outcome_idx = market
            .outcomes
            .iter()
            .position(|o| o.id == outcome_id)
            .ok_or_else(|| CascadeProtocolError::OutcomeNotFound(outcome_id.clone()))?;

        market.outcomes[outcome_idx].total_staked += amount;
        market.total_staked += amount;

        // Transfer tokens from user to contract
        let app_chain_id = self.runtime.application_id().creation.chain_id;
        self.runtime.transfer(
            None,
            Account::chain(app_chain_id),
            Amount::from_tokens(amount.into()),
        );

        // Create bet record
        let bet_id = self.state.generate_id().await?;
        let bet = Bet {
            id: bet_id,
            owner: caller,
            market_id: market_id.clone(),
            outcome_id: outcome_id.clone(),
            amount,
            claimed: false,
        };

        // Save updated market and bet
        self.state.update_market(market).await?;
        self.state.add_bet(bet).await?;

        Ok(())
    }

    /// Resolve a market with the winning outcome (Admin only)
    async fn resolve_market(
        &mut self,
        market_id: String,
        winning_outcome_id: String,
    ) -> Result<(), CascadeProtocolError> {
        // Check admin authorization
        let caller = self.runtime
            .authenticated_signer()
            .ok_or(CascadeProtocolError::Unauthorized)?;

        let admin = self.state.admin.get();
        if *admin != Some(caller) {
            return Err(CascadeProtocolError::Unauthorized);
        }

        // Load market
        let mut market = self
            .state
            .markets
            .get(&market_id)
            .await?
            .ok_or_else(|| CascadeProtocolError::MarketNotFound(market_id.clone()))?;

        // Verify market is active
        if market.status != MarketStatus::Active {
            return Err(CascadeProtocolError::MarketNotActive);
        }

        // Verify winning outcome exists
        if !market.outcomes.iter().any(|o| o.id == winning_outcome_id) {
            return Err(CascadeProtocolError::OutcomeNotFound(winning_outcome_id.clone()));
        }

        // Update market
        market.status = MarketStatus::Resolved;
        market.winning_outcome_id = Some(winning_outcome_id);

        // Save updated market
        self.state.update_market(market).await?;

        Ok(())
    }

    /// Claim winnings from a resolved market
    async fn claim_winnings(
        &mut self,
        market_id: String,
    ) -> Result<(), CascadeProtocolError> {
        // Get the caller
        let caller = self.runtime
            .authenticated_signer()
            .ok_or(CascadeProtocolError::Unauthorized)?;

        // Load market
        let market = self
            .state
            .markets
            .get(&market_id)
            .await?
            .ok_or_else(|| CascadeProtocolError::MarketNotFound(market_id.clone()))?;

        // Verify market is resolved
        if market.status != MarketStatus::Resolved {
            return Err(CascadeProtocolError::MarketNotResolved);
        }

        let winning_outcome_id = market
            .winning_outcome_id
            .as_ref()
            .ok_or(CascadeProtocolError::MarketNotResolved)?;

        // Find user's bet on the winning outcome
        let user_bets = self.state.bets_by_owner.get(&caller).await?.unwrap_or_default();
        
        let mut winning_bet = None;
        for bet in user_bets.iter() {
            if bet.market_id == market_id && bet.outcome_id == *winning_outcome_id && !bet.claimed {
                winning_bet = Some(bet.clone());
                break;
            }
        }

        let mut bet = winning_bet.ok_or(CascadeProtocolError::BetNotFound)?;

        // Check if already claimed
        if bet.claimed {
            return Err(CascadeProtocolError::AlreadyClaimed);
        }

        // Calculate payout
        let winning_outcome = market
            .outcomes
            .iter()
            .find(|o| o.id == *winning_outcome_id)
            .unwrap();

        let payout = if winning_outcome.total_staked > 0 {
            (bet.amount as u128 * market.total_staked as u128 / winning_outcome.total_staked as u128) as u64
        } else {
            0
        };

        if payout == 0 {
            return Err(CascadeProtocolError::InsufficientFunds {
                required: 1,
                available: 0,
            });
        }

        // Transfer winnings to user
        let app_chain_id = self.runtime.application_id().creation.chain_id;
        self.runtime.transfer(
            Some(caller),
            Account::chain(app_chain_id),
            Amount::from_tokens(payout.into()),
        );

        // Mark bet as claimed
        bet.claimed = true;
        self.state.update_bet(bet).await?;

        Ok(())
    }
}

// Define the ABI for the application
 

 
