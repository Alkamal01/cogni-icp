/**
 * Type definitions for the Ethereum provider interface
 */

// Make this file a module by adding an export
export {};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, callback: (...args: any[]) => void) => void;
      removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
      selectedAddress?: string;
      chainId?: string;
      // Additional properties that might be needed
      enable?: () => Promise<string[]>;
      isConnected?: () => boolean;
    }
  }
}

// Additional Ethereum-related types
export interface EthereumEvent {
  connect: { chainId: string };
  disconnect: { code: number; message: string };
  accountsChanged: string[];
  chainChanged: string;
  message: { type: string; data: unknown };
} 