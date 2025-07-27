use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct GroupActivity {
    pub id: u64,
    pub group_id: u64,
    pub user_id: Principal,
    pub activity_type: String, // "post", "resource", "question", etc.
    pub content: Option<String>,
    pub created_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StudyResource {
    pub id: u64,
    pub group_id: u64,
    pub user_id: Principal,
    pub title: String,
    pub description: Option<String>,
    pub resource_type: String, // "link", "file", "note"
    pub resource_url: Option<String>,
    pub content: Option<String>,
    pub created_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct GroupMessage {
    pub id: u64,
    pub group_id: u64,
    pub user_id: Principal,
    pub content: String,
    pub timestamp: u64,
    pub attachments: Option<Vec<String>>,
} 