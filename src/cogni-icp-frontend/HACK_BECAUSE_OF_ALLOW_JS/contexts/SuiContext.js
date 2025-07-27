import React, { createContext, useContext, useState, useCallback } from 'react';
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
const SuiContext = createContext(undefined);
export const SuiProvider = ({ children }) => {
    const [wallet, setWallet] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const connectWallet = useCallback(async () => {
        setIsLoading(true);
        try {
            // This will be implemented with actual wallet connection logic
            // For now, we'll simulate wallet connection
            const mockWallet = {
                address: '0x' + Math.random().toString(16).substr(2, 40),
                publicKey: '0x' + Math.random().toString(16).substr(2, 64),
                isConnected: true,
            };
            setWallet(mockWallet);
        }
        catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const disconnectWallet = useCallback(() => {
        setWallet(null);
    }, []);
    const createWallet = useCallback(async () => {
        setIsLoading(true);
        try {
            // This will be implemented with actual wallet creation logic
            const address = '0x' + Math.random().toString(16).substr(2, 40);
            const newWallet = {
                address,
                publicKey: '0x' + Math.random().toString(16).substr(2, 64),
                isConnected: true,
            };
            setWallet(newWallet);
            return address;
        }
        catch (error) {
            console.error('Failed to create wallet:', error);
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    return (<QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider>
          <SuiContext.Provider value={{
            wallet,
            connectWallet,
            disconnectWallet,
            createWallet,
            isWalletConnected: !!wallet?.isConnected,
            isLoading,
        }}>
            {children}
          </SuiContext.Provider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>);
};
export const useSui = () => {
    const context = useContext(SuiContext);
    if (context === undefined) {
        throw new Error('useSui must be used within a SuiProvider');
    }
    return context;
};
export default SuiContext;
