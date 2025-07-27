use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct GroupPoll {
    pub id: u64,
    pub group_id: u64,
    pub creator_id: Principal,
    pub question: String,
    pub created_at: u64,
    pub expires_at: Option<u64>,
    pub is_active: bool,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct PollOption {
    pub id: u64,
    pub poll_id: u64,
    pub text: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct PollVote {
    pub id: u64,
    pub poll_id: u64,
    pub option_id: u64,
    pub user_id: Principal,
    pub timestamp: u64,
} 