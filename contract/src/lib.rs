mod contract;
mod error;
mod msg;
mod service;
mod state;

pub use contract::CascadeProtocolContract;
pub use error::CascadeProtocolError;
pub use msg::{InstantiationArgument, Message, Operation};
pub use service::CascadeProtocolService;
pub use state::CascadeProtocol;

// Register the contract implementation
linera_sdk::contract!(CascadeProtocolContract);

// Register the service implementation
linera_sdk::service!(CascadeProtocolService);