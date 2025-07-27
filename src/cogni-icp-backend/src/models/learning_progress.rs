use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct LearningProgress {
    pub id: u64,
    pub user_id: Principal,
    pub session_id: u64,
    pub course_id: u64,
    pub current_module_id: Option<u64>,
    pub progress_percentage: f32,
    pub last_activity: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct LearningPathProgress {
    pub id: u64,
    pub user_id: Principal,
    pub learning_path_id: u64,
    pub current_module_id: Option<u64>,
    pub progress_percentage: f32,
    pub last_activity: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ModuleCompletion {
    pub id: u64,
    pub user_id: Principal,
    pub module_id: u64,
    pub completed: bool,
    pub completion_date: Option<u64>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct LearningMetrics {
    pub id: u64,
    pub user_id: Principal,
    pub session_id: u64,
    pub date: u64,
    pub time_spent_minutes: u32,
    pub messages_sent: u32,
    pub comprehension_scores: String, // JSON string
    pub difficulty_adjustments: String, // JSON string
    pub engagement_metrics: String, // JSON string
} 