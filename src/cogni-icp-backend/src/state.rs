use crate::models::{
    user::User,
    tutor::{Tutor, TutorSession},
    learning_path::LearningPath,
    connections::{UserConnection, ConnectionRequest},
    study_group::{StudyGroup, GroupMembership, GroupActivity, StudyResource, GroupMessage, GroupPoll, PollVote, StudySession, SessionParticipant},
};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, StableCell};
use ic_stable_structures::storable::{Storable, Bound};
use std::borrow::Cow;
use std::cell::RefCell;
use candid::Principal;

type Memory = VirtualMemory<DefaultMemoryImpl>;

const USER_MEMORY_ID: MemoryId = MemoryId::new(0);
const TUTOR_MEMORY_ID: MemoryId = MemoryId::new(1);
const TUTOR_SESSION_MEMORY_ID: MemoryId = MemoryId::new(2);
const LEARNING_PATH_MEMORY_ID: MemoryId = MemoryId::new(3);
const CONNECTION_MEMORY_ID: MemoryId = MemoryId::new(4);
const CONNECTION_REQUEST_MEMORY_ID: MemoryId = MemoryId::new(5);
const STUDY_GROUP_MEMORY_ID: MemoryId = MemoryId::new(6);
const GROUP_MEMBERSHIP_MEMORY_ID: MemoryId = MemoryId::new(7);


const ID_COUNTER_MEMORY_ID: MemoryId = MemoryId::new(10);


#[derive(serde::Serialize, serde::Deserialize, Default, Clone)]
struct IdCounters {
    tutor: u64,
    tutor_session: u64,
    learning_path: u64,
    connection: u64,
    connection_request: u64,
    study_group: u64,
    group_membership: u64,
}

impl Storable for IdCounters {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_cbor::to_vec(&self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_cbor::from_slice(bytes.as_ref()).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

thread_local! {
    // The memory manager is used for managing memory allocation for stable structures.
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // The users map stores User structs, keyed by their Principal.
    pub static USERS: RefCell<StableBTreeMap<Principal, User, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USER_MEMORY_ID)),
        )
    );

    // Stable storage for Tutors
    pub static TUTORS: RefCell<StableBTreeMap<u64, Tutor, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(TUTOR_MEMORY_ID)),
        )
    );

    // Stable storage for Tutor Sessions
    pub static TUTOR_SESSIONS: RefCell<StableBTreeMap<u64, TutorSession, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(TUTOR_SESSION_MEMORY_ID)),
        )
    );

    // Stable storage for Learning Paths
    pub static LEARNING_PATHS: RefCell<StableBTreeMap<u64, LearningPath, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(LEARNING_PATH_MEMORY_ID)),
        )
    );

    // Stable storage for Connections
    pub static CONNECTIONS: RefCell<StableBTreeMap<u64, UserConnection, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(CONNECTION_MEMORY_ID)),
        )
    );

    // Stable storage for Connection Requests
    pub static CONNECTION_REQUESTS: RefCell<StableBTreeMap<u64, ConnectionRequest, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(CONNECTION_REQUEST_MEMORY_ID)),
        )
    );

    // Stable storage for Study Groups
    pub static STUDY_GROUPS: RefCell<StableBTreeMap<u64, StudyGroup, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(STUDY_GROUP_MEMORY_ID)),
        )
    );

    // Stable storage for Group Memberships
    pub static GROUP_MEMBERSHIPS: RefCell<StableBTreeMap<u64, GroupMembership, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(GROUP_MEMBERSHIP_MEMORY_ID)),
        )
    );


    // Stable cell for ID counters
    pub static ID_COUNTERS: RefCell<StableCell<IdCounters, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(ID_COUNTER_MEMORY_ID)),
            IdCounters::default()
        ).expect("failed to init id counters")
    );
}

// Helper function to increment and get the next ID for a given type
pub fn next_id(entity: &str) -> u64 {
    ID_COUNTERS.with(|counters| {
        let mut writer = counters.borrow_mut();
        let mut current_counters = writer.get().clone();
        match entity {
            "tutor" => {
                current_counters.tutor += 1;
                writer.set(current_counters).unwrap();
                writer.get().tutor
            }
            "tutor_session" => {
                current_counters.tutor_session += 1;
                writer.set(current_counters).unwrap();
                writer.get().tutor_session
            }
            "learning_path" => {
                current_counters.learning_path += 1;
                writer.set(current_counters).unwrap();
                writer.get().learning_path
            }
            "connection" => {
                current_counters.connection += 1;
                writer.set(current_counters).unwrap();
                writer.get().connection
            }
            "connection_request" => {
                current_counters.connection_request += 1;
                writer.set(current_counters).unwrap();
                writer.get().connection_request
            }
            "study_group" => {
                current_counters.study_group += 1;
                writer.set(current_counters).unwrap();
                writer.get().study_group
            }
            "group_membership" => {
                current_counters.group_membership += 1;
                writer.set(current_counters).unwrap();
                writer.get().group_membership
            }
            _ => panic!("Unknown entity type for ID generation"),
        }
    })
} 