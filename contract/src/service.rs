use async_graphql::{EmptyMutation, EmptySubscription, Request, Response, Schema};
use linera_sdk::{base::WithServiceAbi, Service, ServiceRuntime};

use crate::state::CascadeProtocol;

/// The service implementation for Cascade Protocol (GraphQL queries)
pub struct CascadeProtocolService {
    state: CascadeProtocol<ServiceRuntime>,
}

linera_sdk::service!(CascadeProtocolService);

impl WithServiceAbi for CascadeProtocolService {
    type Abi = crate::contract::CascadeProtocolAbi;
}

impl Service for CascadeProtocolService {
    type Error = linera_views::views::ViewError;
    type State = CascadeProtocol<ServiceRuntime>;

    async fn new(state: Self::State, _runtime: ServiceRuntime) -> Result<Self, Self::Error> {
        Ok(CascadeProtocolService { state })
    }

    async fn handle_query(&self, request: Request) -> Result<Response, Self::Error> {
        // Create GraphQL schema
        let schema = Schema::build(
            self.state.clone(),
            EmptyMutation,
            EmptySubscription,
        )
        .finish();

        // Execute the query
        Ok(schema.execute(request).await)
    }
}

// Additional query helpers can be implemented here as separate GraphQL objects
// Example: Statistics, leaderboards, etc.

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        state::{Market, MarketStatus, Outcome},
        msg::MarketCategory,
    };
    use linera_sdk::base::Owner;

    // Note: These are placeholder tests. In a real implementation,
    // you would need to set up proper test fixtures with mock runtime.

    #[test]
    fn test_market_serialization() {
        let market = Market {
            id: "test_1".to_string(),
            question: "Will BTC reach $100k?".to_string(),
            outcomes: vec![
                Outcome {
                    id: "test_1_0".to_string(),
                    name: "Yes".to_string(),
                    total_staked: 1000,
                },
                Outcome {
                    id: "test_1_1".to_string(),
                    name: "No".to_string(),
                    total_staked: 2000,
                },
            ],
            total_staked: 3000,
            status: MarketStatus::Active,
            expiry_time: 1234567890,
            winning_outcome_id: None,
            parent_id: None,
            category: MarketCategory::Crypto,
        };

        // Test that the market can be serialized/deserialized
        let serialized = serde_json::to_string(&market).unwrap();
        let deserialized: Market = serde_json::from_str(&serialized).unwrap();
        
        assert_eq!(market.id, deserialized.id);
        assert_eq!(market.question, deserialized.question);
        assert_eq!(market.outcomes.len(), deserialized.outcomes.len());
    }

    #[test]
    fn test_odds_calculation() {
        let market = Market {
            id: "test_1".to_string(),
            question: "Test market".to_string(),
            outcomes: vec![
                Outcome {
                    id: "test_1_0".to_string(),
                    name: "Outcome A".to_string(),
                    total_staked: 1000,
                },
                Outcome {
                    id: "test_1_1".to_string(),
                    name: "Outcome B".to_string(),
                    total_staked: 3000,
                },
            ],
            total_staked: 4000,
            status: MarketStatus::Active,
            expiry_time: 1234567890,
            winning_outcome_id: None,
            parent_id: None,
            category: MarketCategory::Other,
        };

        // Outcome A has 1000/4000 staked, so odds should be 4.0
        let odds_a = market.calculate_odds("test_1_0");
        assert!((odds_a - 4.0).abs() < 0.01);

        // Outcome B has 3000/4000 staked, so odds should be ~1.33
        let odds_b = market.calculate_odds("test_1_1");
        assert!((odds_b - 1.333).abs() < 0.01);
    }
}