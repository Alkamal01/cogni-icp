use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct SubscriptionPlan {
    pub id: u64,
    pub name: String, // "Free", "Pro", "Enterprise"
    pub price_naira: u64, // Price in kobo
    pub billing_cycle: String, // "monthly", "yearly"
    pub features: Vec<String>,
    pub limits: HashMap<String, u32>,
    pub paystack_plan_code: Option<String>,
    pub is_active: bool,
    pub created_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UserSubscription {
    pub id: u64,
    pub user_id: Principal,
    pub plan_id: u64,
    pub paystack_customer_code: Option<String>,
    pub paystack_subscription_code: Option<String>,
    pub paystack_email_token: Option<String>,
    pub status: String, // "active", "cancelled", "expired", "failed"
    pub start_date: u64,
    pub end_date: Option<u64>,
    pub next_payment_date: Option<u64>,
    pub amount_naira: u64,
    pub currency: String,
    pub auto_renew: bool,
    pub created_at: u64,
    pub updated_at: u64,
    pub cancelled_at: Option<u64>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct PaymentTransaction {
    pub id: u64,
    pub user_id: Principal,
    pub subscription_id: Option<u64>,
    pub paystack_reference: String,
    pub paystack_access_code: Option<String>,
    pub paystack_transaction_id: Option<String>,
    pub amount_naira: u64,
    pub currency: String,
    pub status: String, // "pending", "success", "failed", "abandoned"
    pub payment_method: Option<String>,
    pub description: Option<String>,
    pub payment_metadata: Option<HashMap<String, String>>,
    pub created_at: u64,
    pub paid_at: Option<u64>,
} 