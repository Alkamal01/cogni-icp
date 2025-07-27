use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ic_stable_structures::storable::{Storable, Bound};
use std::borrow::Cow;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Achievement {
    pub id: u64,
    pub public_id: String,
    pub title: String,
    pub description: String,
    pub category: String,
    pub icon: Option<String>,
    pub requirements: String,
    pub reward_tokens: u32,
    pub reward_points: u32,
    pub is_active: bool,
    pub created_at: u64,
    pub created_by: Principal,
}

impl Storable for Achievement {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(serde_cbor::to_vec(&self).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self { serde_cbor::from_slice(bytes.as_ref()).unwrap() }
    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UserAchievement {
    pub id: u64,
    pub user_id: Principal,
    pub achievement_id: u64,
    pub progress: f32, // 0.0 to 100.0
    pub is_completed: bool,
    pub completed_at: Option<u64>,
    pub tokens_earned: u32,
    pub points_earned: u32,
    pub created_at: u64,
    pub updated_at: u64,
}

impl Storable for UserAchievement {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(serde_cbor::to_vec(&self).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self { serde_cbor::from_slice(bytes.as_ref()).unwrap() }
    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Task {
    pub id: u64,
    pub public_id: String,
    pub title: String,
    pub description: String,
    pub category: String, // 'learning', 'social', 'engagement'
    pub difficulty: String, // 'easy', 'medium', 'hard'
    pub token_reward: u32,
    pub points_reward: u32,
    pub requirements: Option<String>,
    pub is_active: bool,
    pub is_repeatable: bool,
    pub max_completions: u32,
    pub created_by: Principal,
    pub created_at: u64,
    pub expires_at: Option<u64>,
    pub metadata: Option<HashMap<String, String>>,
}

impl Storable for Task {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(serde_cbor::to_vec(&self).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self { serde_cbor::from_slice(bytes.as_ref()).unwrap() }
    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UserTaskCompletion {
    pub id: u64,
    pub user_id: Principal,
    pub task_id: u64,
    pub completed_at: u64,
    pub tokens_earned: u32,
    pub points_earned: u32,
    pub completion_count: u32,
    pub proof_data: Option<String>, // JSON string
    pub metadata: Option<HashMap<String, String>>,
}

impl Storable for UserTaskCompletion {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(serde_cbor::to_vec(&self).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self { serde_cbor::from_slice(bytes.as_ref()).unwrap() }
    const BOUND: Bound = Bound::Unbounded;
} 