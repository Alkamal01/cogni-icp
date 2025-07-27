use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use ic_stable_structures::storable::{Storable, Bound};
use std::borrow::Cow;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UserConnection {
    pub id: u64,
    pub user1_id: Principal,
    pub user2_id: Principal,
    pub status: String, // "active", "blocked"
    pub created_at: u64,
    pub updated_at: u64,
}

impl Storable for UserConnection {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_cbor::to_vec(&self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_cbor::from_slice(bytes.as_ref()).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}


#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ConnectionRequest {
    pub id: u64,
    pub sender_id: Principal,
    pub receiver_id: Principal,
    pub status: String, // "pending", "accepted", "rejected"
    pub message: Option<String>,
    pub created_at: u64,
    pub updated_at: u64,
    pub responded_at: Option<u64>,
}

impl Storable for ConnectionRequest {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_cbor::to_vec(&self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_cbor::from_slice(bytes.as_ref()).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
} 