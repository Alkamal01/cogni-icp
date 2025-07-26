// Re-export Ethereum event type from ethereum.d.ts
export type { EthereumEvent } from './ethereum';

// Define additional shared types that might be used across the application
export interface XionTransaction {
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
}

// Define blockchain-related constants
export const BLOCKCHAIN_NETWORKS = {
  XION_MAINNET: 'xion-mainnet',
  XION_TESTNET: 'xion-testnet',
  ETHEREUM_MAINNET: '1',
  ETHEREUM_GOERLI: '5'
};

// Define transaction types
export enum TransactionType {
  PAYMENT = 'payment',
  NFT_MINT = 'nft_mint',
  TOKEN_TRANSFER = 'token_transfer'
}

// Define NFT-related interfaces
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: Record<string, any>;
} 