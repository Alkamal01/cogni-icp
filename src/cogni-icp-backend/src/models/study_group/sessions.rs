use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StudySession {
    pub id: u64,
    pub group_id: u64,
    pub creator_id: Principal,
    pub title: String,
    pub description: Option<String>,
    pub date: String, // Using String for date "YYYY-MM-DD"
    pub time: String, // Using String for time "HH:MM"
    pub duration_minutes: u32,
    pub max_participants: u32,
    pub topics: Vec<String>,
    pub created_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct SessionParticipant {
    pub id: u64,
    pub session_id: u64,
    pub user_id: Principal,
    pub status: String, // "confirmed", "pending", "declined"
    pub joined_at: u64,
} 