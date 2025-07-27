pub mod activity;
pub mod polls;
pub mod sessions;

use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use ic_stable_structures::storable::{Storable, Bound};
use std::borrow::Cow;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StudyGroup {
    pub id: u64,
    pub public_id: String,
    pub name: String,
    pub description: Option<String>,
    pub creator_id: Principal,
    pub topic_id: Option<u64>,
    pub is_private: bool,
    pub max_members: u32,
    pub learning_level: String, // "beginner", "intermediate", "advanced"
    pub meeting_frequency: Option<String>,
    pub goals: Option<String>,
    pub created_at: u64,
    pub updated_at: u64,
}

impl Storable for StudyGroup {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_cbor::to_vec(&self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_cbor::from_slice(bytes.as_ref()).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct GroupMembership {
    pub id: u64,
    pub user_id: Principal,
    pub group_id: u64,
    pub role: String, // "member", "admin", "moderator"
    pub status: String, // "active", "inactive", "banned"
    pub joined_at: u64,
    pub contributions: u32,
    pub last_active_at: Option<u64>,
}

impl Storable for GroupMembership {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_cbor::to_vec(&self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_cbor::from_slice(bytes.as_ref()).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Topic {
    pub id: u64,
    pub name: String,
    pub description: Option<String>,
    pub parent_id: Option<u64>,
    pub difficulty_level: Option<String>,
    pub keywords: Option<String>,
    pub created_at: u64,
} 