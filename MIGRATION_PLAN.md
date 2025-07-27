# Python to Rust Canister Migration Plan

This document outlines the plan for migrating the existing Python Flask backend to a new Rust-based backend canister on the Internet Computer.

## 1. Core Principles & Design Changes

- **Stateless Architecture**: The IC is a replicated state machine. We will move away from a traditional database model and store all application state directly within the canister's memory, using stable memory for persistence across upgrades.
- **No Filesystem**: The canister does not have a traditional filesystem. All file uploads and storage (e.g., knowledge base files, user avatars) will be handled in canister memory.
- **Asynchronous Operations**: Features that used Celery for background tasks (like sending emails) will be re-implemented using asynchronous canister calls or timers.
- **Configuration & Secrets**: All configuration and secrets (API keys, etc.) will be managed securely using the IC's secrets management capabilities, not environment variables.
- **Authentication**: We will replace JWTs with the IC's native Internet Identity for user authentication, which is more secure and idiomatic for the platform.

## 2. Data Structure Migration

The following SQLAlchemy models from the Python backend will be re-implemented as Rust structs. We will use `ic-stable-structures` for efficient and upgrade-safe storage.

### User & Authentication
- `User`: Will become the core `User` struct. It will hold profile information, wallet addresses, and links to other data.
- `UserSettings` (and its subclasses): This will be flattened into a single `UserSettings` struct owned by the `User`.
- `LoginHistory` & `LoginSession`: This functionality will be re-evaluated. Some of it may be unnecessary with Internet Identity, but we can retain login tracking if needed.

### Learning & Tutors
- `Tutor` & `TutorSession`: These will be mapped to `Tutor` and `TutorSession` structs. `TutorMessage` will be a nested struct within a `TutorSession`.
- `TutorCourse`, `CourseModule`, `ModuleCompletion`: These will be mapped to corresponding structs to represent the course structure.
- `LearningPath`, `LearningPathModule`: These will be mapped to corresponding structs.
- `LearningProgress`, `LearningPathProgress`, `LearningMetrics`: These will be implemented to track user progress within the canister.
- `KnowledgeBaseFile`: This will be a struct that stores file metadata, with the file content stored in a separate stable memory structure.

### Social & Collaboration
- `StudyGroup`, `GroupMembership`: These will be mapped to `StudyGroup` and `GroupMembership` structs.
- `Topic`, `GroupActivity`, `StudyResource`, `GroupMessage`: These will be implemented as structs related to a `StudyGroup`.
- `GroupPoll`, `PollOption`, `PollVote`: These will be implemented to support the polling feature.
- `StudySession`, `SessionParticipant`: These will be implemented to manage group study sessions.
- `UserConnection`, `ConnectionRequest`: These will be mapped to structs to manage the social connection features.

### Gamification & Notifications
- `Achievement`, `UserAchievement`: These will be implemented to manage the gamification system.
- `Task`, `UserTaskCompletion`: These will be implemented for the reward system.
- `Notification`: This will be a struct to handle user notifications.

### Billing & Subscriptions
- `SubscriptionPlan`, `UserSubscription`, `PaymentTransaction`: These will be mapped to structs. The integration with Paystack will need to be re-implemented via HTTPS outcalls.

## 3. API Endpoint Migration

The following Flask Blueprints will be re-implemented as public methods on our Rust canister. Each method will be exposed via the Candid interface.

- **Auth API**:
  - `register`, `login`, `logout`, `verify_email`, `reset_password`, `oauth_callback`
  - *Note*: These will be adapted to use Internet Identity.
- **Users API**:
  - `get_profile`, `update_profile`, `get_user_by_public_id`
- **User Settings API**:
  - `get_settings`, `update_settings`
- **Tutors API**:
  - `create_tutor`, `get_tutors`, `get_tutor`, `update_tutor`, `delete_tutor`, `chat_with_tutor`, `get_chat_history`, `rate_tutor`, `upload_knowledge_base_file`
- **Audio API**:
  - `generate_audio` (will use HTTPS outcalls to ElevenLabs)
- **Learning API**:
  - `get_learning_paths`, `get_learning_path`, `track_progress`
- **Achievements API**:
  - `get_achievements`, `get_user_achievements`
- **Notifications API**:
  - `get_notifications`, `mark_as_read`
- **Study Groups API**:
  - All endpoints related to creating, joining, and managing study groups, their resources, messages, and polls.
- **Billing API**:
  - `get_plans`, `create_subscription`, `cancel_subscription`, `handle_webhook` (will use HTTPS outcalls to Paystack)
- **Connections API**:
  - `send_request`, `accept_request`, `reject_request`, `get_connections`
- **Admin API**:
  - All endpoints for managing users, tutors, and other application data.
- **Sui & ZK Prover API**:
  - Endpoints for interacting with the Sui blockchain will be re-implemented using HTTPS outcalls.

## 4. Phased Implementation Plan

1.  **Phase 1: Core Data Structures**: Implement all the Rust structs for the data models identified above.
2.  **Phase 2: User Authentication & Profile**: Implement the core user management features using Internet Identity.
3.  **Phase 3: Tutors & Learning**: Implement the AI tutor and learning path functionality.
4.  **Phase 4: Study Groups & Social**: Implement the collaborative features.
5.  **Phase 5: Billing & Gamification**: Implement the subscription and rewards systems.
6.  **Phase 6: Admin & Blockchain**: Implement the final pieces of the application.

This plan provides a comprehensive roadmap for the migration. Please review it carefully. We can adjust priorities and add details as needed before we begin the implementation. 