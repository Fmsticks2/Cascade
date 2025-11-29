mod contract;
mod error;
mod msg;
mod service;
mod state;

use linera_sdk::{Contract, Service};

pub use contract::CascadeProtocolContract;
pub use error::CascadeProtocolError;
pub use msg::{InstantiationArgument, Message, Operation};
pub use service::CascadeProtocolService;
pub use state::CascadeProtocol;

// Register the contract implementation
linera_sdk::contract!(CascadeProtocolContract);

// Register the service implementation
linera_sdk::service!(CascadeProtocolService);

pub struct CascadeProtocolAbi;

impl linera_sdk::abi::ContractAbi for CascadeProtocolAbi {
    type Operation = msg::Operation;
    type Response = msg::Message;
}

impl linera_sdk::abi::ServiceAbi for CascadeProtocolAbi {
    type Query = async_graphql::Request;
    type QueryResponse = async_graphql::Response;
}
