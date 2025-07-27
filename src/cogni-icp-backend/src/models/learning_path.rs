use candid::CandidType;
use serde::{Deserialize, Serialize};
use ic_stable_structures::storable::{Storable, Bound};
use std::borrow::Cow;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct LearningPath {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub level: String,
    pub duration: String,
    pub thumbnail: Option<String>,
    pub tags: Vec<String>,
    pub created_at: u64,
    pub updated_at: u64,
    pub modules: Vec<LearningPathModule>,
}

impl Storable for LearningPath {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_cbor::to_vec(&self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_cbor::from_slice(bytes.as_ref()).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct LearningPathModule {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub duration: String,
    pub module_type: String, // "video", "reading", "quiz", etc.
    pub order: u32,
    pub content: String, // JSON string
    pub resources: Vec<String>,
} 