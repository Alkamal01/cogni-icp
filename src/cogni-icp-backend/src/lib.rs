mod models;
mod state;

use models::user::{User, UserSettings};
use models::tutor::Tutor;
use state::{USERS, TUTORS, next_id};
use std::collections::HashMap;
use models::connections::{UserConnection, ConnectionRequest};
use state::{CONNECTIONS, CONNECTION_REQUESTS};
use candid::Principal;
use models::study_group::{StudyGroup, GroupMembership};
use state::{STUDY_GROUPS, GROUP_MEMBERSHIPS};

#[ic_cdk::query]
fn get_self() -> Option<User> {
    let principal = ic_cdk::caller();
    USERS.with(|users| users.borrow().get(&principal))
}

#[ic_cdk::update]
fn create_user(username: String, email: String) -> User {
    let principal = ic_cdk::caller();
    
    // TODO: Add validation to ensure username and email are unique.

    let default_settings = UserSettings {
        learning_style: "visual".to_string(),
        preferred_language: "en".to_string(),
        difficulty_level: "intermediate".to_string(),
        daily_goal_hours: 1,
        two_factor_enabled: false,
        font_size: "medium".to_string(),
        contrast: "normal".to_string(),
        ai_interaction_style: "casual".to_string(),
        profile_visibility: "public".to_string(),
        activity_sharing: "connections".to_string(),
    };

    let new_user = User {
        id: principal,
        public_id: principal.to_string(), // Using principal as public_id for now
        email,
        username,
        first_name: None,
        last_name: None,
        is_active: true,
        is_verified: false, // Will be verified via email or other method
        created_at: ic_cdk::api::time(),
        updated_at: ic_cdk::api::time(),
        last_login: None,
        oauth_provider: None,
        oauth_id: None,
        avatar_url: None,
        bio: None,
        blockchain_wallet_address: None,
        blockchain_wallet_type: None,
        blockchain_wallet_connected_at: None,
        wallet_address: None,
        public_key: None,
        role: "user".to_string(),
        status: "active".to_string(),
        location: None,
        subscription: "free".to_string(),
        last_active: ic_cdk::api::time(),
        settings: default_settings,
    };

    USERS.with(|users| {
        users.borrow_mut().insert(principal, new_user.clone());
    });

    new_user
}

#[ic_cdk::update]
fn create_tutor(
    name: String,
    description: String,
    teaching_style: String,
    personality: String,
    expertise: Vec<String>,
) -> Tutor {
    let caller = ic_cdk::caller();
    let tutor_id = next_id("tutor");

    let new_tutor = Tutor {
        id: tutor_id,
        public_id: tutor_id.to_string(),
        user_id: caller,
        name,
        description,
        teaching_style,
        personality,
        expertise,
        knowledge_base: vec![],
        is_pinned: false,
        avatar_url: None,
        voice_id: None,
        voice_settings: HashMap::new(),
        created_at: ic_cdk::api::time(),
        updated_at: ic_cdk::api::time(),
    };

    TUTORS.with(|tutors| {
        tutors.borrow_mut().insert(tutor_id, new_tutor.clone());
    });

    new_tutor
}

#[ic_cdk::query]
fn get_tutor(id: u64) -> Option<Tutor> {
    TUTORS.with(|tutors| tutors.borrow().get(&id))
}

#[ic_cdk::query]
fn get_tutors() -> Vec<Tutor> {
    let caller = ic_cdk::caller();
    TUTORS.with(|tutors| {
        tutors
            .borrow()
            .iter()
            .filter(|(_, tutor)| tutor.user_id == caller)
            .map(|(_, tutor)| tutor.clone())
            .collect()
    })
}

#[ic_cdk::update]
fn send_connection_request(receiver_id: Principal, message: Option<String>) -> Result<ConnectionRequest, String> {
    let sender_id = ic_cdk::caller();
    if sender_id == receiver_id {
        return Err("Cannot send connection request to yourself.".to_string());
    }

    // TODO: Check if already connected or request already exists

    let request_id = next_id("connection_request");
    let new_request = ConnectionRequest {
        id: request_id,
        sender_id,
        receiver_id,
        status: "pending".to_string(),
        message,
        created_at: ic_cdk::api::time(),
        updated_at: ic_cdk::api::time(),
        responded_at: None,
    };

    CONNECTION_REQUESTS.with(|requests| {
        requests.borrow_mut().insert(request_id, new_request.clone());
    });

    Ok(new_request)
}

#[ic_cdk::update]
fn accept_connection_request(request_id: u64) -> Result<UserConnection, String> {
    let caller = ic_cdk::caller();
    
    let request = CONNECTION_REQUESTS.with(|requests| requests.borrow().get(&request_id))
        .ok_or("Connection request not found.".to_string())?;

    if request.receiver_id != caller {
        return Err("You are not authorized to accept this request.".to_string());
    }

    if request.status != "pending" {
        return Err("This request is no longer pending.".to_string());
    }

    // Update request status
    let updated_request = ConnectionRequest {
        status: "accepted".to_string(),
        responded_at: Some(ic_cdk::api::time()),
        ..request
    };
    CONNECTION_REQUESTS.with(|requests| {
        requests.borrow_mut().insert(request_id, updated_request);
    });

    // Create a new connection
    let connection_id = next_id("connection");
    let new_connection = UserConnection {
        id: connection_id,
        user1_id: request.sender_id,
        user2_id: request.receiver_id,
        status: "active".to_string(),
        created_at: ic_cdk::api::time(),
        updated_at: ic_cdk::api::time(),
    };

    CONNECTIONS.with(|connections| {
        connections.borrow_mut().insert(connection_id, new_connection.clone());
    });
    
    Ok(new_connection)
}

#[ic_cdk::query]
fn get_connections() -> Vec<UserConnection> {
    let caller = ic_cdk::caller();
    CONNECTIONS.with(|connections| {
        connections
            .borrow()
            .iter()
            .filter(|(_, conn)| conn.user1_id == caller || conn.user2_id == caller)
            .map(|(_, conn)| conn.clone())
            .collect()
    })
}

#[ic_cdk::update]
fn create_study_group(
    name: String,
    description: Option<String>,
    is_private: bool,
    max_members: u32,
    learning_level: String,
) -> Result<StudyGroup, String> {
    let caller = ic_cdk::caller();
    let group_id = next_id("study_group");

    let new_group = StudyGroup {
        id: group_id,
        public_id: group_id.to_string(),
        name,
        description,
        creator_id: caller,
        topic_id: None, // Can be set later
        is_private,
        max_members,
        learning_level,
        meeting_frequency: None,
        goals: None,
        created_at: ic_cdk::api::time(),
        updated_at: ic_cdk::api::time(),
    };

    STUDY_GROUPS.with(|groups| {
        groups.borrow_mut().insert(group_id, new_group.clone());
    });
    
    // Automatically add the creator as the first member and admin
    let membership_id = next_id("group_membership");
    let new_membership = GroupMembership {
        id: membership_id,
        user_id: caller,
        group_id,
        role: "admin".to_string(),
        status: "active".to_string(),
        joined_at: ic_cdk::api::time(),
        contributions: 0,
        last_active_at: Some(ic_cdk::api::time()),
    };

    GROUP_MEMBERSHIPS.with(|memberships| {
        memberships.borrow_mut().insert(membership_id, new_membership);
    });

    Ok(new_group)
}

#[ic_cdk::update]
fn join_study_group(group_id: u64) -> Result<GroupMembership, String> {
    let caller = ic_cdk::caller();
    
    // Check if group exists
    let _group = STUDY_GROUPS.with(|groups| groups.borrow().get(&group_id))
        .ok_or("Study group not found.".to_string())?;

    // TODO: Add checks for private groups, max members, etc.
    
    let membership_id = next_id("group_membership");
    let new_membership = GroupMembership {
        id: membership_id,
        user_id: caller,
        group_id,
        role: "member".to_string(),
        status: "active".to_string(),
        joined_at: ic_cdk::api::time(),
        contributions: 0,
        last_active_at: Some(ic_cdk::api::time()),
    };

    GROUP_MEMBERSHIPS.with(|memberships| {
        memberships.borrow_mut().insert(membership_id, new_membership.clone());
    });

    Ok(new_membership)
}

#[ic_cdk::query]
fn get_study_group(id: u64) -> Option<StudyGroup> {
    STUDY_GROUPS.with(|groups| groups.borrow().get(&id))
}
