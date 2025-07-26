import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create a custom API instance for Sui operations
const suiApi = axios.create({
  baseURL: `${API_BASE_URL}/api/sui`
});

// Add request interceptor to attach JWT token to all requests
suiApi.interceptors.request.use(
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

export interface ZKLoginRequest {
  email?: string;
  walletAddress: string;
  publicKey: string;
  proof: string;
  salt: string;
}

export interface WalletCreationRequest {
  userId: number;
  walletAddress: string;
  publicKey: string;
}

export interface AchievementRequest {
  userId: number;
  achievementId: string;
  walletAddress: string;
  transactionHash?: string;
}

export interface PaymentRequest {
  userId: number;
  amount: number;
  currency: string;
  walletAddress: string;
  description: string;
}

class SuiService {
  // ZK Login functionality
  async zkLogin(data: ZKLoginRequest) {
    try {
      const response = await suiApi.post('/zk-login', data);
      return response.data;
    } catch (error) {
      console.error('ZK Login error:', error);
      throw error;
    }
  }

  // Create wallet for user
  async createWallet(data: WalletCreationRequest) {
    try {
      const response = await suiApi.post('/create-wallet', data);
      return response.data;
    } catch (error) {
      console.error('Create wallet error:', error);
      throw error;
    }
  }

  // Get user's wallet
  async getUserWallet(userId: number) {
    try {
      const response = await suiApi.get(`/wallet/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get wallet error:', error);
      throw error;
    }
  }

  // Update user's wallet
  async updateWallet(userId: number, walletData: Partial<WalletCreationRequest>) {
    try {
      const response = await suiApi.put(`/wallet/${userId}`, walletData);
      return response.data;
    } catch (error) {
      console.error('Update wallet error:', error);
      throw error;
    }
  }

  // Create achievement on blockchain
  async createAchievement(data: AchievementRequest) {
    try {
      const response = await suiApi.post('/achievements', data);
      return response.data;
    } catch (error) {
      console.error('Create achievement error:', error);
      throw error;
    }
  }

  // Get user achievements
  async getUserAchievements(userId: number) {
    try {
      const response = await suiApi.get(`/achievements/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get achievements error:', error);
      throw error;
    }
  }

  // Process payment
  async processPayment(data: PaymentRequest) {
    try {
      const response = await suiApi.post('/payments', data);
      return response.data;
    } catch (error) {
      console.error('Process payment error:', error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(userId: number) {
    try {
      const response = await suiApi.get(`/payments/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get payment history error:', error);
      throw error;
    }
  }

  // Get Sui network status
  async getNetworkStatus() {
    try {
      const response = await suiApi.get('/network-status');
      return response.data;
    } catch (error) {
      console.error('Get network status error:', error);
      throw error;
    }
  }

  // Verify ZK proof
  async verifyZKProof(proof: string, publicInputs: any) {
    try {
      const response = await suiApi.post('/verify-proof', {
        proof,
        publicInputs
      });
      return response.data;
    } catch (error) {
      console.error('Verify ZK proof error:', error);
      throw error;
    }
  }

  // Generate ZK proof (this would typically be done client-side)
  async generateZKProof(inputs: any) {
    try {
      const response = await suiApi.post('/generate-proof', inputs);
      return response.data;
    } catch (error) {
      console.error('Generate ZK proof error:', error);
      throw error;
    }
  }

  // Get transaction status
  async getTransactionStatus(txHash: string) {
    try {
      const response = await suiApi.get(`/transaction/${txHash}`);
      return response.data;
    } catch (error) {
      console.error('Get transaction status error:', error);
      throw error;
    }
  }

  // Get wallet balance
  async getWalletBalance(walletAddress: string) {
    try {
      const response = await suiApi.get(`/balance/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Get wallet balance error:', error);
      throw error;
    }
  }
}

export default new SuiService(); 