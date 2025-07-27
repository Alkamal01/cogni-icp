import React, { useState } from 'react';
import { Card } from './index';
import { Check, CreditCard, Shield, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MockSuiWalletProps {
  className?: string;
}

const MockSuiWallet: React.FC<MockSuiWalletProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Generate a mock wallet address based on user's ZK login address or create one
  const getWalletAddress = (): string => {
    if (user?.wallet_address && user.wallet_address.length > 0 && user.wallet_address[0]) {
      return user.wallet_address[0];
    }
    
    // Generate a mock address based on user's email or ID
    const base = user?.email || user?.id?.toString() || 'user';
    const hash = base.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Create a Sui-style address (0x + 64 hex characters)
    const hexString = Math.abs(hash).toString(16).padStart(64, '0');
    return `0x${hexString}`;
  };

  const walletAddress = getWalletAddress();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
          Sui Wallet
        </h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              ZK Login
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Wallet Address */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Wallet Address
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                {formatAddress(walletAddress)}
              </p>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Wallet Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Network
              </span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Sui Devnet
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Type
              </span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              ZK Login
            </p>
          </div>
        </div>

        {/* Wallet Features */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Wallet Features
          </h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Earn CEdu tokens for learning activities
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Trade tokens on Sui DEX
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Privacy-preserving authentication
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Connect to external wallets (coming soon)
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => window.open('https://suiexplorer.com/address/' + walletAddress, '_blank')}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>View on Explorer</span>
          </button>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>ZK Login Wallet:</strong> This wallet address is automatically generated from your Google account when you sign in with ZK. 
            It's used for earning CEdu tokens and participating in blockchain activities on this platform.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default MockSuiWallet; 