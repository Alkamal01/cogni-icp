use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Notification {
    pub id: u64,
    pub user_id: Principal,
    pub notification_type: String, // "info", "success", "warning", "error"
    pub content: String,
    pub is_read: bool,
    pub source: String, // "tutor", "study_group", "achievement", etc.
    pub related_id: Option<u64>,
    pub timestamp: u64,
} 