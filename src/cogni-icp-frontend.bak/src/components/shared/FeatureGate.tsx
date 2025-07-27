import React, { ReactNode } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Lock, Star, Shield } from 'lucide-react';
import Button from './Button';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  usageCount?: number;
  upgradeMessage?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  usageCount = 0,
  upgradeMessage
}) => {
  const { hasFeatureAccess, checkUsageLimit, showUpgradePrompt: showUpgrade, subscription } = useSubscription();

  // Check if user has access to the feature
  const hasAccess = hasFeatureAccess(feature);
  
  // If it's a numeric limit, check usage
  let canUse = hasAccess;
  let limitMessage = '';
  
  if (hasAccess && usageCount > 0) {
    const usageCheck = checkUsageLimit(feature, usageCount);
    canUse = usageCheck.canPerform;
    limitMessage = usageCheck.message || '';
  }

  if (canUse) {
    return <>{children}</>;
  }

  // If a custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt UI
  if (showUpgradePrompt) {
    const currentPlan = subscription?.plan?.name || 'Free';
    const isFeatureLimit = usageCount > 0;
    
    return (
      <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center mb-4">
          {currentPlan === 'Free' ? (
            <Star className="h-8 w-8 text-amber-500 mr-3" />
          ) : (
            <Shield className="h-8 w-8 text-purple-500 mr-3" />
          )}
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {isFeatureLimit ? 'Usage Limit Reached' : 'Premium Feature'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Current plan: {currentPlan}
            </div>
          </div>
        </div>
        
        <div className="text-gray-700 dark:text-gray-300 mb-4">
          {upgradeMessage || limitMessage || `This feature requires a higher subscription plan.`}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Lock className="h-4 w-4 mr-1" />
            Upgrade to unlock
          </div>
          
          <Button
            variant="primary"
            size="sm"
            onClick={() => showUpgrade(feature)}
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  // If no upgrade prompt should be shown, just hide the content
  return null;
};

// Usage limit indicator component
interface UsageLimitIndicatorProps {
  feature: string;
  currentUsage: number;
  showDetails?: boolean;
}

export const UsageLimitIndicator: React.FC<UsageLimitIndicatorProps> = ({
  feature,
  currentUsage,
  showDetails = false
}) => {
  const { getFeatureLimit, subscription } = useSubscription();
  
  const limit = getFeatureLimit(feature);
  
  if (typeof limit !== 'number') {
    return null;
  }
  
  const percentage = Math.min((currentUsage / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = currentUsage >= limit;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Usage
        </span>
        <span className={`text-sm font-medium ${
          isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-green-600'
        }`}>
          {currentUsage} / {limit}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showDetails && isNearLimit && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {isAtLimit 
            ? 'You\'ve reached your limit. Upgrade to continue using this feature.'
            : 'You\'re approaching your limit. Consider upgrading soon.'
          }
        </p>
      )}
    </div>
  );
};

// Plan badge component
export const PlanBadge: React.FC = () => {
  const { subscription } = useSubscription();
  
  const planName = subscription?.plan?.name || 'Free';
  
  const getBadgeColor = (plan: string) => {
    switch (plan) {
      case 'Pro':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Enterprise':
        return 'bg-gold-100 text-gold-800 dark:bg-gold-900 dark:text-gold-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(planName)}`}>
      {planName}
    </span>
  );
};

export default FeatureGate; 