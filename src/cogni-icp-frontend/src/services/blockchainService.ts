import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create a custom API instance for blockchain operations
const blockchainApi = axios.create({
  baseURL: `${API_BASE_URL}/api/sui`
});

// Add request interceptor to attach JWT token to all requests
blockchainApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface BlockchainTaskCompletion {
  task_public_id: string;
  proof_data?: string;
}

export interface BlockchainTaskCreation {
  public_id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  token_reward: number;
  points_reward?: number;
  requirements?: string;
  is_active?: boolean;
  is_repeatable?: boolean;
  max_completions?: number;
  expires_at?: string;
}

export interface BlockchainAchievementCreation {
  achievement_public_id: string;
}

export interface ContractSetup {
  package_id: string;
  reward_tasks_manager_id: string;
  mint_cap_id: string;
}

export interface TransactionVerification {
  transaction_hash: string;
}

export interface WalletValidation {
  wallet_address: string;
}

export interface BlockchainTransaction {
  target: string;
  arguments: string[];
  gas_budget: string;
}

export interface BlockchainResponse {
  success: boolean;
  message: string;
  blockchain_transaction?: BlockchainTransaction;
  task?: any;
  achievement?: any;
  balance?: any;
  verification?: any;
  stats?: any;
  contracts?: any;
}

class BlockchainService {
  // Complete a task on the blockchain
  async completeTaskOnBlockchain(data: BlockchainTaskCompletion): Promise<BlockchainResponse> {
    try {
      const response = await blockchainApi.post('/blockchain/tasks/complete', data);
      return response.data;
    } catch (error) {
      console.error('Blockchain task completion error:', error);
      throw error;
    }
  }

  // Create a task on the blockchain (admin only)
  async createTaskOnBlockchain(data: BlockchainTaskCreation): Promise<BlockchainResponse> {
    try {
      const response = await blockchainApi.post('/blockchain/tasks/create', data);
      return response.data;
    } catch (error) {
      console.error('Blockchain task creation error:', error);
      throw error;
    }
  }

  // Create an achievement on the blockchain
  async createAchievementOnBlockchain(data: BlockchainAchievementCreation): Promise<BlockchainResponse> {
    try {
      const response = await blockchainApi.post('/blockchain/achievements/create', data);
      return response.data;
    } catch (error) {
      console.error('Blockchain achievement creation error:', error);
      throw error;
    }
  }

  // Get user's token balance from blockchain
  async getTokenBalance(): Promise<BlockchainResponse> {
    try {
      const response = await blockchainApi.get('/blockchain/tokens/balance');
      return response.data;
    } catch (error) {
      console.error('Token balance check error:', error);
      throw error;
    }
  }

  // Verify a blockchain transaction
  async verifyTransaction(data: TransactionVerification): Promise<BlockchainResponse> {
    try {
      const response = await blockchainApi.post('/blockchain/transactions/verify', data);
      return response.data;
    } catch (error) {
      console.error('Transaction verification error:', error);
      throw error;
    }
  }

  // Get blockchain statistics
  async getBlockchainStats(): Promise<BlockchainResponse> {
    try {
      const response = await blockchainApi.get('/blockchain/stats');
      return response.data;
    } catch (error) {
      console.error('Blockchain stats error:', error);
      throw error;
    }
  }

  // Validate a wallet address
  async validateWalletAddress(data: WalletValidation): Promise<BlockchainResponse> {
    try {
      const response = await blockchainApi.post('/blockchain/wallet/validate', data);
      return response.data;
    } catch (error) {
      console.error('Wallet validation error:', error);
      throw error;
    }
  }

  // Set up contract addresses (admin only)
  async setupContractAddresses(data: ContractSetup): Promise<BlockchainResponse> {
    try {
      const response = await blockchainApi.post('/blockchain/contracts/setup', data);
      return response.data;
    } catch (error) {
      console.error('Contract setup error:', error);
      throw error;
    }
  }

  // Execute a blockchain transaction (this would typically be done through a wallet)
  async executeTransaction(transactionData: BlockchainTransaction): Promise<any> {
    try {
      // This is a placeholder - in a real implementation, this would:
      // 1. Send the transaction to the user's wallet
      // 2. Wait for the user to sign and submit
      // 3. Return the transaction hash
      
      console.log('Transaction to execute:', transactionData);
      
      // For now, return a mock response
      return {
        success: true,
        transaction_hash: '0x' + Math.random().toString(16).substr(2, 64),
        message: 'Transaction submitted to wallet'
      };
    } catch (error) {
      console.error('Transaction execution error:', error);
      throw error;
    }
  }

  // Get user's blockchain achievements
  async getUserBlockchainAchievements(): Promise<any[]> {
    try {
      // This would query the blockchain for user's achievements
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Get blockchain achievements error:', error);
      throw error;
    }
  }

  // Sync task completion to blockchain
  async syncTaskCompletionToBlockchain(taskPublicId: string, proofData?: string): Promise<BlockchainResponse> {
    try {
      const response = await this.completeTaskOnBlockchain({
        task_public_id: taskPublicId,
        proof_data: proofData || ''
      });
      return response;
    } catch (error) {
      console.error('Sync task completion error:', error);
      throw error;
    }
  }

  // Check if user has wallet connected
  hasWalletAddress(): boolean {
    // This would check if the user has a wallet address stored
    // For now, return false
    return false;
  }

  // Get wallet address from user profile
  getWalletAddress(): string | null {
    // This would get the wallet address from user context
    // For now, return null
    return null;
  }

  // Connect wallet (this would integrate with wallet providers)
  async connectWallet(): Promise<{ success: boolean; wallet_address?: string; error?: string }> {
    try {
      // This would integrate with wallet providers like Sui Wallet
      // For now, return a mock response
      return {
        success: true,
        wallet_address: '0x' + Math.random().toString(16).substr(2, 64)
      };
    } catch (error) {
      console.error('Wallet connection error:', error);
      return {
        success: false,
        error: 'Failed to connect wallet'
      };
    }
  }
}

export default new BlockchainService(); 