import React, { useState } from 'react';
import { useSui } from '../../contexts/SuiContext';
import { Button } from '../shared';
import Card from '../shared/Card';
import { CreditCard, Plus, Check, AlertCircle } from 'lucide-react';
export const WalletManager = ({ onWalletCreated, onError }) => {
    const { wallet, createWallet, connectWallet, disconnectWallet, isWalletConnected, isLoading } = useSui();
    const [copied, setCopied] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const handleCreateWallet = async () => {
        try {
            setIsCreating(true);
            const address = await createWallet();
            onWalletCreated?.(address);
        }
        catch (error) {
            onError?.('Failed to create wallet');
        }
        finally {
            setIsCreating(false);
        }
    };
    const handleConnectWallet = async () => {
        try {
            await connectWallet();
        }
        catch (error) {
            onError?.('Failed to connect wallet');
        }
    };
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };
    return (<Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-blue-600"/>
          <h3 className="text-lg font-semibold text-gray-900">Sui Wallet</h3>
        </div>

        {!wallet ? (<div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5"/>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">No Wallet Connected</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Create a new wallet or connect an existing one to use blockchain features.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button onClick={handleCreateWallet} disabled={isCreating || isLoading} className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white">
                {isCreating ? ('Creating...') : (<>
                    <Plus className="h-4 w-4 mr-2"/>
                    Create New Wallet
                  </>)}
              </Button>

              <Button onClick={handleConnectWallet} disabled={isLoading} variant="outline" className="flex-1">
                Connect Wallet
              </Button>
            </div>
          </div>) : (<div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-green-600"/>
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Wallet Connected</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your wallet is ready for transactions
                    </p>
                  </div>
                </div>
                <Button onClick={disconnectWallet} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  Disconnect
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Address
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm">
                    {wallet.address}
                  </div>
                  <Button onClick={() => copyToClipboard(wallet.address)} variant="outline" size="sm" className="px-3">
                    {copied ? <Check className="h-4 w-4"/> : 'Copy'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Public Key
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm">
                    {wallet.publicKey}
                  </div>
                  <Button onClick={() => copyToClipboard(wallet.publicKey)} variant="outline" size="sm" className="px-3">
                    {copied ? <Check className="h-4 w-4"/> : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Wallet Features</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Make premium payments</li>
                <li>• Earn and spend tokens</li>
                <li>• Participate in achievements</li>
                <li>• Secure ZK login</li>
              </ul>
            </div>
          </div>)}
      </div>
    </Card>);
};
export default WalletManager;
