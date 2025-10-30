// Admin API Client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalGames: number;
  totalRevenue: number;
  pendingWithdrawals: number;
  todaySignups: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  verified: boolean;
  gemsBalance: number;
  diamonds: number;
  rtdBalance: number;
  knowledgePoints: number;
  createdAt: string;
  lastLoginAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: string;
  currency: string;
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  username: string;
  amount: number;
  fee: number;
  netAmount: number;
  walletAddress: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  txHash?: string;
  createdAt: string;
  processedAt?: string;
}

class AdminAPI {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminToken', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('adminToken');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  // Admin Authentication
  async adminLogin(email: string, password: string) {
    // Demo mode - accept any credentials
    // In production, this would call the real API endpoint
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate a demo token
      const demoToken = 'demo_admin_token_' + Date.now();
      this.setToken(demoToken);

      return {
        success: true,
        token: demoToken,
        user: {
          email,
          role: 'admin',
          name: 'Admin User'
        }
      };

      // Real API call (commented out for demo)
      // const data = await this.request('/admin/login', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password }),
      // });
      // if (data.token) {
      //   this.setToken(data.token);
      // }
      // return data;
    } catch (error) {
      throw new Error('Login failed. Please try again.');
    }
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<AdminStats> {
    // Mock data for now - will connect to real API
    return Promise.resolve({
      totalUsers: 15234,
      activeUsers: 8432,
      totalGames: 45678,
      totalRevenue: 12345.67,
      pendingWithdrawals: 23,
      todaySignups: 156,
    });
  }

  // User Management
  async getUsers(page: number = 1, limit: number = 20, search?: string) {
    // Mock data
    return {
      users: Array.from({ length: limit }, (_, i) => ({
        id: `user_${page}_${i}`,
        username: `player${page * limit + i}`,
        email: `player${page * limit + i}@chess2earn.com`,
        verified: Math.random() > 0.2,
        gemsBalance: Math.floor(Math.random() * 10000),
        diamonds: Math.floor(Math.random() * 100),
        rtdBalance: Math.random() * 10,
        knowledgePoints: Math.floor(Math.random() * 5000),
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      })),
      pagination: {
        page,
        limit,
        total: 15234,
        pages: Math.ceil(15234 / limit),
      },
    };
  }

  async getUserById(userId: string) {
    return this.request(`/admin/users/${userId}`);
  }

  async updateUser(userId: string, data: Partial<User>) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async banUser(userId: string, reason: string) {
    return this.request(`/admin/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Transactions
  async getTransactions(page: number = 1, limit: number = 50) {
    // Mock data
    const types = ['EARN', 'SPEND', 'CONVERT', 'WITHDRAWAL', 'REFUND', 'BONUS'];
    const currencies = ['GEMS', 'DIAMONDS', 'RTD'];

    return {
      transactions: Array.from({ length: limit }, (_, i) => ({
        id: `txn_${page}_${i}`,
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        username: `player${Math.floor(Math.random() * 1000)}`,
        type: types[Math.floor(Math.random() * types.length)],
        currency: currencies[Math.floor(Math.random() * currencies.length)],
        amount: Math.random() * 1000,
        balance: Math.random() * 10000,
        description: 'Transaction description',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      })),
      pagination: { page, limit, total: 45678, pages: 914 },
    };
  }

  // Withdrawals
  async getWithdrawals(status?: string) {
    const statuses: Withdrawal['status'][] = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];

    return {
      withdrawals: Array.from({ length: 20 }, (_, i) => ({
        id: `wd_${i}`,
        userId: `user_${i}`,
        username: `player${i}`,
        amount: Math.random() * 10,
        fee: 0.001,
        netAmount: Math.random() * 10 - 0.001,
        walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      })),
    };
  }

  async approveWithdrawal(withdrawalId: string) {
    return this.request(`/admin/withdrawals/${withdrawalId}/approve`, {
      method: 'POST',
    });
  }

  async rejectWithdrawal(withdrawalId: string, reason: string) {
    return this.request(`/admin/withdrawals/${withdrawalId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Analytics
  async getAnalytics(period: '7d' | '30d' | '90d' = '30d') {
    // Mock analytics data
    return {
      userGrowth: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        users: Math.floor(Math.random() * 100 + 50),
      })),
      revenueData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: Math.random() * 500 + 200,
      })),
      gameActivity: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        games: Math.floor(Math.random() * 1000 + 500),
      })),
    };
  }
}

export const adminAPI = new AdminAPI();
