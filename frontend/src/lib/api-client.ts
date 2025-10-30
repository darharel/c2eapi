/**
 * Chess2Earn API Client
 * Centralized API client for connecting frontend to backend
 * Usage: import { apiClient } from '@/lib/api-client'
 */

// Get API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Token storage keys
const TOKEN_KEY = 'chess2earn_token';
const REFRESH_TOKEN_KEY = 'chess2earn_refresh_token';

/**
 * API Response type
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

/**
 * Token storage utilities
 */
export const tokenStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    const token = tokenStorage.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (token && !options.headers?.['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && endpoint !== '/auth/refresh') {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        const refreshResponse = await apiFetch('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.success && refreshResponse.data?.token) {
          tokenStorage.setToken(refreshResponse.data.token);
          // Retry original request with new token
          return apiFetch<T>(endpoint, options);
        }
      }
      // Refresh failed, clear tokens
      tokenStorage.clearTokens();
    }

    return data;
  } catch (error: any) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error.message || 'Network error',
      code: 'NETWORK_ERROR',
    };
  }
}

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Register a new user
   */
  register: async (username: string, email: string): Promise<ApiResponse> => {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email }),
    });
  },

  /**
   * Verify email with 6-digit code
   */
  verify: async (email: string, code: string): Promise<ApiResponse> => {
    const response = await apiFetch('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });

    if (response.success && response.data?.token) {
      tokenStorage.setToken(response.data.token);
      if (response.data.refreshToken) {
        tokenStorage.setRefreshToken(response.data.refreshToken);
      }
    }

    return response;
  },

  /**
   * Resend verification code
   */
  resendCode: async (email: string): Promise<ApiResponse> => {
    return apiFetch('/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Login (passwordless - sends email with code)
   */
  login: async (email: string): Promise<ApiResponse> => {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Refresh access token
   */
  refresh: async (): Promise<ApiResponse> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    const response = await apiFetch('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.success && response.data?.token) {
      tokenStorage.setToken(response.data.token);
    }

    return response;
  },

  /**
   * Logout (clear tokens)
   */
  logout: (): void => {
    tokenStorage.clearTokens();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!tokenStorage.getToken();
  },
};

/**
 * User API
 */
export const userAPI = {
  getProfile: async (): Promise<ApiResponse> => {
    return apiFetch('/users/profile');
  },

  updateProfile: async (data: any): Promise<ApiResponse> => {
    return apiFetch('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  linkChesscom: async (username: string): Promise<ApiResponse> => {
    return apiFetch('/users/link-chesscom', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  },

  verifyChesscom: async (): Promise<ApiResponse> => {
    return apiFetch('/users/verify-chesscom', {
      method: 'POST',
    });
  },

  deleteAccount: async (): Promise<ApiResponse> => {
    return apiFetch('/users/account', {
      method: 'DELETE',
    });
  },

  search: async (query: string): Promise<ApiResponse> => {
    return apiFetch(`/users/search?q=${encodeURIComponent(query)}`);
  },
};

/**
 * Wallet API
 */
export const walletAPI = {
  getBalance: async (): Promise<ApiResponse> => {
    return apiFetch('/wallet');
  },

  getTransactions: async (): Promise<ApiResponse> => {
    return apiFetch('/wallet/transactions');
  },

  convertGemsToDiamonds: async (amount: number): Promise<ApiResponse> => {
    return apiFetch('/wallet/convert/gems-to-diamonds', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  convertDiamondsToRTD: async (amount: number): Promise<ApiResponse> => {
    return apiFetch('/wallet/convert/diamonds-to-rtd', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  withdraw: async (amount: number, address: string): Promise<ApiResponse> => {
    return apiFetch('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, address }),
    });
  },

  getWithdrawals: async (): Promise<ApiResponse> => {
    return apiFetch('/wallet/withdrawals');
  },
};

/**
 * Games API
 */
export const gamesAPI = {
  sync: async (): Promise<ApiResponse> => {
    return apiFetch('/games/sync', {
      method: 'POST',
    });
  },

  getAll: async (): Promise<ApiResponse> => {
    return apiFetch('/games');
  },

  analyze: async (gameId: string): Promise<ApiResponse> => {
    return apiFetch(`/games/${gameId}/analyze`, {
      method: 'POST',
    });
  },

  getAnalysis: async (gameId: string): Promise<ApiResponse> => {
    return apiFetch(`/games/${gameId}/analysis`);
  },

  deepScan: async (): Promise<ApiResponse> => {
    return apiFetch('/games/deep-scan', {
      method: 'POST',
    });
  },

  getDeepScan: async (scanId: string): Promise<ApiResponse> => {
    return apiFetch(`/games/deep-scan/${scanId}`);
  },
};

/**
 * Quests API
 */
export const questsAPI = {
  getAll: async (): Promise<ApiResponse> => {
    return apiFetch('/quests');
  },

  complete: async (questId: string): Promise<ApiResponse> => {
    return apiFetch(`/quests/${questId}/complete`, {
      method: 'POST',
    });
  },

  getDaily: async (): Promise<ApiResponse> => {
    return apiFetch('/quests/daily');
  },

  completeDaily: async (missionId: string): Promise<ApiResponse> => {
    return apiFetch(`/quests/daily/${missionId}/complete`, {
      method: 'POST',
    });
  },

  getWeekly: async (): Promise<ApiResponse> => {
    return apiFetch('/quests/weekly');
  },
};

/**
 * Leaderboard API
 */
export const leaderboardAPI = {
  getGlobal: async (): Promise<ApiResponse> => {
    return apiFetch('/leaderboard/global');
  },

  getFriends: async (): Promise<ApiResponse> => {
    return apiFetch('/leaderboard/friends');
  },

  getRank: async (): Promise<ApiResponse> => {
    return apiFetch('/leaderboard/rank');
  },

  getTop: async (): Promise<ApiResponse> => {
    return apiFetch('/leaderboard/top');
  },
};

/**
 * Tournaments API
 */
export const tournamentsAPI = {
  getAll: async (): Promise<ApiResponse> => {
    return apiFetch('/tournaments');
  },

  join: async (tournamentId: string): Promise<ApiResponse> => {
    return apiFetch(`/tournaments/${tournamentId}/join`, {
      method: 'POST',
    });
  },

  getDetails: async (tournamentId: string): Promise<ApiResponse> => {
    return apiFetch(`/tournaments/${tournamentId}`);
  },

  getStandings: async (tournamentId: string): Promise<ApiResponse> => {
    return apiFetch(`/tournaments/${tournamentId}/standings`);
  },

  submitResults: async (tournamentId: string, results: any): Promise<ApiResponse> => {
    return apiFetch(`/tournaments/${tournamentId}/results`, {
      method: 'POST',
      body: JSON.stringify(results),
    });
  },
};

/**
 * Marketplace API
 */
export const marketplaceAPI = {
  getItems: async (): Promise<ApiResponse> => {
    return apiFetch('/market/items');
  },

  purchase: async (itemId: string): Promise<ApiResponse> => {
    return apiFetch('/market/purchase', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    });
  },

  getInventory: async (): Promise<ApiResponse> => {
    return apiFetch('/market/inventory');
  },

  useItem: async (itemId: string): Promise<ApiResponse> => {
    return apiFetch('/market/use', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    });
  },
};

/**
 * Stats API
 */
export const statsAPI = {
  getUser: async (): Promise<ApiResponse> => {
    return apiFetch('/stats/user');
  },

  getTrends: async (): Promise<ApiResponse> => {
    return apiFetch('/stats/trends');
  },

  getOpenings: async (): Promise<ApiResponse> => {
    return apiFetch('/stats/openings');
  },

  getTimeControls: async (): Promise<ApiResponse> => {
    return apiFetch('/stats/time-controls');
  },
};

/**
 * Social API (Friends & Referrals)
 */
export const socialAPI = {
  getReferralCode: async (): Promise<ApiResponse> => {
    return apiFetch('/friends/code');
  },

  applyReferral: async (code: string): Promise<ApiResponse> => {
    return apiFetch('/friends/apply', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  getReferralStats: async (): Promise<ApiResponse> => {
    return apiFetch('/friends/stats');
  },

  getFriends: async (): Promise<ApiResponse> => {
    return apiFetch('/friends');
  },

  addFriend: async (userId: string): Promise<ApiResponse> => {
    return apiFetch('/friends/add', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  removeFriend: async (userId: string): Promise<ApiResponse> => {
    return apiFetch(`/friends/${userId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Openings API
 */
export const openingsAPI = {
  getAll: async (): Promise<ApiResponse> => {
    return apiFetch('/openings');
  },

  unlock: async (openingId: string): Promise<ApiResponse> => {
    return apiFetch(`/openings/${openingId}/unlock`, {
      method: 'POST',
    });
  },
};

/**
 * Health Check
 */
export const healthAPI = {
  check: async (): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_URL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Health check failed',
      };
    }
  },
};

/**
 * Main API Client Export
 */
export const apiClient = {
  auth: authAPI,
  user: userAPI,
  wallet: walletAPI,
  games: gamesAPI,
  quests: questsAPI,
  leaderboard: leaderboardAPI,
  tournaments: tournamentsAPI,
  marketplace: marketplaceAPI,
  stats: statsAPI,
  social: socialAPI,
  openings: openingsAPI,
  health: healthAPI,
};

export default apiClient;
