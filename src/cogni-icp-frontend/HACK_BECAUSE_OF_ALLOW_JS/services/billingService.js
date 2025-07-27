import api from '../utils/apiClient';
class BillingService {
    /**
     * Get all available subscription plans
     */
    async getPlans() {
        const response = await api.get('/api/billing/plans');
        return response.data.plans;
    }
    /**
     * Get current user's subscription
     */
    async getSubscription() {
        const response = await api.get('/api/billing/subscription');
        return response.data.subscription;
    }
    /**
     * Get detailed subscription status
     */
    async getSubscriptionStatus() {
        const response = await api.get('/api/billing/status');
        return response.data;
    }
    /**
     * Subscribe to a plan
     */
    async subscribe(planId, callbackUrl) {
        const response = await api.post('/api/billing/subscribe', {
            plan_id: planId,
            callback_url: callbackUrl || `${window.location.origin}/billing/callback`
        });
        return response.data;
    }
    /**
     * Upgrade/change subscription plan
     */
    async upgradeSubscription(planId, callbackUrl) {
        const response = await api.post('/api/billing/upgrade', {
            plan_id: planId,
            callback_url: callbackUrl || `${window.location.origin}/billing/callback`
        });
        return response.data;
    }
    /**
     * Verify payment after successful transaction
     */
    async verifyPayment(reference) {
        const response = await api.post('/api/billing/verify-payment', {
            reference
        });
        return response.data;
    }
    /**
     * Cancel current subscription
     */
    async cancelSubscription() {
        const response = await api.post('/api/billing/cancel');
        return response.data;
    }
    /**
     * Get user's payment transactions
     */
    async getTransactions(page = 1, perPage = 10) {
        const response = await api.get('/api/billing/transactions', {
            params: { page, per_page: perPage }
        });
        return response.data;
    }
    /**
     * Check if user has feature access based on subscription
     */
    hasFeatureAccess(feature, subscription) {
        if (!subscription || !subscription.is_active) {
            // Free tier access
            const freeLimits = {
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
    getFeatureLimit(feature, subscription) {
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
            return freeLimits[feature] ?? 0;
        }
        const limits = subscription.plan.limits;
        return limits[feature] ?? 0;
    }
    /**
     * Check if user can perform an action based on limits
     */
    canPerformAction(action, currentUsage, subscription) {
        const limit = this.getFeatureLimit(action, subscription);
        if (typeof limit === 'boolean') {
            return limit;
        }
        // For numeric limits, check if current usage is below limit
        return currentUsage < limit;
    }
    /**
     * Format price for display
     */
    formatPrice(priceKobo) {
        return `₦${(priceKobo / 100).toLocaleString()}`;
    }
    /**
     * Get plan by ID
     */
    async getPlan(planId) {
        const plans = await this.getPlans();
        return plans.find(plan => plan.id === planId) || null;
    }
    /**
     * Get plan recommendation based on usage
     */
    getRecommendedPlan(plans, usage) {
        // Simple recommendation logic
        if (usage.tutors_used > 3 || usage.sessions_this_month > 10) {
            return plans.find(plan => plan.name === 'Pro') || null;
        }
        return plans.find(plan => plan.name === 'Free') || null;
    }
    /**
     * Initialize Paystack payment (client-side)
     */
    initializePaystackPayment(config) {
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
