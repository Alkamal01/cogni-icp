import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Network configuration
const { networkConfig } = createNetworkConfig({
  localnet: { url: getFullnodeUrl('localnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
  testnet: { url: getFullnodeUrl('testnet') },
});

const queryClient = new QueryClient();

interface SuiWallet {
  address: string;
  publicKey: string;
  isConnected: boolean;
}

interface SuiContextType {
  wallet: SuiWallet | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  createWallet: () => Promise<string>;
  isWalletConnected: boolean;
  isLoading: boolean;
}

const SuiContext = createContext<SuiContextType | undefined>(undefined);

export const SuiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<SuiWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      // This will be implemented with actual wallet connection logic
      // For now, we'll simulate wallet connection
      const mockWallet: SuiWallet = {
        address: '0x' + Math.random().toString(16).substr(2, 40),
        publicKey: '0x' + Math.random().toString(16).substr(2, 64),
        isConnected: true,
      };
      setWallet(mockWallet);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet(null);
  }, []);

  const createWallet = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    try {
      // This will be implemented with actual wallet creation logic
      const address = '0x' + Math.random().toString(16).substr(2, 40);
      const newWallet: SuiWallet = {
        address,
        publicKey: '0x' + Math.random().toString(16).substr(2, 64),
        isConnected: true,
      };
      setWallet(newWallet);
      return address;
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider>
          <SuiContext.Provider
            value={{
              wallet,
              connectWallet,
              disconnectWallet,
              createWallet,
              isWalletConnected: !!wallet?.isConnected,
              isLoading,
            }}
          >
            {children}
          </SuiContext.Provider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
};

export const useSui = () => {
  const context = useContext(SuiContext);
  if (context === undefined) {
    throw new Error('useSui must be used within a SuiProvider');
  }
  return context;
};

export default SuiContext; 