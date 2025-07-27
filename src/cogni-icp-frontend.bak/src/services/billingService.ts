import api from '../utils/apiClient';

export interface SubscriptionPlan {
  id: number;
  name: string;
  price_naira: number;
  price_formatted: string;
  billing_cycle: string;
  features: string[];
  limits: {
    tutors: number;
    study_groups: number;
    sessions_per_month: number;
    storage_gb: number;
    analytics: boolean;
    priority_support: boolean;
    custom_tutors: boolean;
    [key: string]: any;
  };
  paystack_plan_code: string | null;
  is_active: boolean;
  created_at: string | null;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  plan: SubscriptionPlan;
  status: string;
  start_date: string | null;
  end_date: string | null;
  next_payment_date: string | null;
  amount_naira: number;
  currency: string;
  auto_renew: boolean;
  is_active: boolean;
  days_remaining: number | null;
  created_at: string | null;
  updated_at: string | null;
  cancelled_at: string | null;
}

export interface PaymentTransaction {
  id: number;
  user_id: number;
  subscription_id: number | null;
  paystack_reference: string;
  amount_naira: number;
  amount_formatted: string;
  currency: string;
  status: string;
  payment_method: string;
  description: string;
  created_at: string | null;
  paid_at: string | null;
}

export interface SubscriptionStatus {
  subscription: UserSubscription | null;
  usage: {
    tutors_used: number;
    sessions_this_month: number;
    storage_used_gb: number;
  };
  limits: {
    tutors: number;
    sessions_per_month: number;
    storage_gb: number;
    analytics: boolean;
    priority_support: boolean;
    [key: string]: any;
  };
  can_upgrade: boolean;
}

export interface SubscribeResponse {
  success: boolean;
  message?: string;
  payment_url?: string;
  access_code?: string;
  reference?: string;
  subscription?: UserSubscription;
}

class BillingService {
  /**
   * Get all available subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get('/api/billing/plans');
    return response.data.plans;
  }

  /**
   * Get current user's subscription
   */
  async getSubscription(): Promise<UserSubscription | null> {
    const response = await api.get('/api/billing/subscription');
    return response.data.subscription;
  }

  /**
   * Get detailed subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await api.get('/api/billing/status');
    return response.data;
  }

  /**
   * Subscribe to a plan
   */
  async subscribe(planId: number, callbackUrl?: string): Promise<SubscribeResponse> {
    const response = await api.post('/api/billing/subscribe', {
      plan_id: planId,
      callback_url: callbackUrl || `${window.location.origin}/billing/callback`
    });
    return response.data;
  }

  /**
   * Upgrade/change subscription plan
   */
  async upgradeSubscription(planId: number, callbackUrl?: string): Promise<SubscribeResponse> {
    const response = await api.post('/api/billing/upgrade', {
      plan_id: planId,
      callback_url: callbackUrl || `${window.location.origin}/billing/callback`
    });
    return response.data;
  }

  /**
   * Verify payment after successful transaction
   */
  async verifyPayment(reference: string): Promise<{ success: boolean; subscription?: UserSubscription; message?: string }> {
    const response = await api.post('/api/billing/verify-payment', {
      reference
    });
    return response.data;
  }

  /**
   * Cancel current subscription
   */
  async cancelSubscription(): Promise<{ success: boolean; message?: string }> {
    const response = await api.post('/api/billing/cancel');
    return response.data;
  }

  /**
   * Get user's payment transactions
   */
  async getTransactions(page: number = 1, perPage: number = 10): Promise<{
    transactions: PaymentTransaction[];
    pagination: {
      page: number;
      pages: number;
      per_page: number;
      total: number;
    };
  }> {
    const response = await api.get('/api/billing/transactions', {
      params: { page, per_page: perPage }
    });
    return response.data;
  }

  /**
   * Check if user has feature access based on subscription
   */
  hasFeatureAccess(feature: string, subscription: UserSubscription | null): boolean {
    if (!subscription || !subscription.is_active) {
      // Free tier access
      const freeLimits: Record<string, boolean> = {
        analytics: false,
        priority_support: false,
        custom_tutors: false
      };
      return freeLimits[feature] ?? false;
    }

    const limits = subscription.plan.limits;
    const value = limits[feature];
    
    // For boolean features, return the boolean value
    if (typeof value === 'boolean') {
      return value;
    }
    
    // For numeric features, return true if limit is greater than 0
    if (typeof value === 'number') {
      return value > 0;
    }
    
    // Default to false for unknown features
    return false;
  }

  /**
   * Get usage limit for a feature
   */
  getFeatureLimit(feature: string, subscription: UserSubscription | null): number | boolean {
    if (!subscription || !subscription.is_active) {
      // Free tier limits
      const freeLimits = {
        tutors: 3,
        study_groups: 2,
        sessions_per_month: 10,
        storage_gb: 1,
        analytics: false,
        priority_support: false,
        custom_tutors: false
      };
      return freeLimits[feature as keyof typeof freeLimits] ?? 0;
    }

    const limits = subscription.plan.limits;
    return limits[feature] ?? 0;
  }

  /**
   * Check if user can perform an action based on limits
   */
  canPerformAction(action: string, currentUsage: number, subscription: UserSubscription | null): boolean {
    const limit = this.getFeatureLimit(action, subscription);
    
    if (typeof limit === 'boolean') {
      return limit;
    }
    
    // For numeric limits, check if current usage is below limit
    return currentUsage < (limit as number);
  }

  /**
   * Format price for display
   */
  formatPrice(priceKobo: number): string {
    return `₦${(priceKobo / 100).toLocaleString()}`;
  }

  /**
   * Get plan by ID
   */
  async getPlan(planId: number): Promise<SubscriptionPlan | null> {
    const plans = await this.getPlans();
    return plans.find(plan => plan.id === planId) || null;
  }

  /**
   * Get plan recommendation based on usage
   */
  getRecommendedPlan(plans: SubscriptionPlan[], usage: any): SubscriptionPlan | null {
    // Simple recommendation logic
    if (usage.tutors_used > 3 || usage.sessions_this_month > 10) {
      return plans.find(plan => plan.name === 'Pro') || null;
    }
    
    return plans.find(plan => plan.name === 'Free') || null;
  }

  /**
   * Initialize Paystack payment (client-side)
   */
  initializePaystackPayment(config: {
    key: string;
    email: string;
    amount: number;
    ref: string;
    onSuccess: (response: any) => void;
    onCancel: () => void;
  }): void {
    // This would integrate with Paystack Inline JS
    // For now, we'll redirect to the payment URL
    console.log('Paystack payment config:', config);
    
    // In a real implementation, you would load Paystack Inline JS:
    // const handler = PaystackPop.setup({
    //   key: config.key,
    //   email: config.email,
    //   amount: config.amount,
    //   ref: config.ref,
    //   onClose: config.onCancel,
    //   callback: config.onSuccess
    // });
    // handler.openIframe();
  }
}

export default new BillingService(); 