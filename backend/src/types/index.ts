// User types
export interface User {
  id: string;
  username: string;
  email: string;
  verified: boolean;
  chessComUsername?: string;
  chessComVerified: boolean;
  avatar?: string;
  bio?: string;
  country?: string;
  gemsBalance: number;
  diamonds: number;
  rtdBalance: number;
  knowledgePoints: number;
  totalGamesAnalyzed: number;
  deepScansUsed: number;
  winStreak: number;
  referralCode: string;
  referredBy?: string;
  totalReferrals: number;
  createdAt: Date;
  lastLoginAt: Date;
}

// Authentication types
export interface VerificationCode {
  id: string;
  email: string;
  code: string;
  userId?: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

// Game types
export interface Game {
  id: string;
  userId: string;
  chessComGameUrl: string;
  result: 'WIN' | 'LOSS' | 'DRAW';
  userColor: 'white' | 'black';
  opponentUsername: string;
  opponentRating: number;
  userRating: number;
  accuracy: number;
  timeControl: string;
  moves: number;
  analyzed: boolean;
  analysisId?: string;
  playedAt: Date;
  syncedAt: Date;
}

// Analysis types
export interface GameAnalysis {
  analysisId: string;
  gameId: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  insights: AnalysisInsight[];
  summary: AnalysisSummary;
  recommendations: string[];
  knowledgePointsAwarded: number;
  completedAt?: Date;
}

export interface AnalysisInsight {
  moveNumber: number;
  move: string;
  evaluation: number;
  type: 'MISTAKE' | 'BLUNDER' | 'EXCELLENT' | 'GOOD' | 'INACCURACY';
  suggestion?: string;
  explanation: string;
}

export interface AnalysisSummary {
  accuracy: number;
  mistakes: number;
  blunders: number;
  excellentMoves: number;
  averageTimePerMove: number;
  openingName: string;
  openingAccuracy: number;
}

// Currency types
export type CurrencyType = 'GEMS' | 'DIAMONDS' | 'RTD';
export type TransactionType = 'EARN' | 'SPEND' | 'CONVERT' | 'WITHDRAWAL' | 'REFUND' | 'BONUS';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  currency: CurrencyType;
  amount: number;
  balance: number;
  description: string;
  createdAt: Date;
}

// Withdrawal types
export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  fee: number;
  netAmount: number;
  walletAddress: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  txHash?: string;
  memo?: string;
  createdAt: Date;
  processedAt?: Date;
}

// Quest types
export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'ANALYSIS' | 'GAMEPLAY' | 'SOCIAL' | 'LEARNING' | 'DAILY';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  requirement: QuestRequirement;
  progress: number;
  rewards: QuestReward;
  status: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  expiresAt?: Date;
}

export interface QuestRequirement {
  type: string;
  target: number | string;
  current: number | boolean;
}

export interface QuestReward {
  gems?: number;
  knowledgePoints?: number;
  badge?: string;
  diamonds?: number;
}

// Opening types
export interface Opening {
  id: string;
  name: string;
  family: string;
  description: string;
  moves: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  knowledgePointsRequired: number;
}

// Badge types
export interface Badge {
  id: string;
  openingId: string;
  openingName: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD';
  description: string;
  requirement: number;
}

// Tournament types
export interface Tournament {
  id: string;
  name: string;
  description: string;
  type: 'BLITZ' | 'RAPID' | 'BULLET' | 'DAILY';
  format: 'SWISS' | 'KNOCKOUT' | 'ARENA' | 'ROUND_ROBIN';
  status: 'UPCOMING' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  entryFee: { gems?: number; diamonds?: number };
  prizePool: any;
  participants: number;
  maxParticipants?: number;
  startTime: Date;
  endTime?: Date;
  timeControl: string;
  currentRound?: number;
  totalRounds?: number;
}

// Marketplace types
export interface MarketItem {
  id: string;
  name: string;
  description: string;
  category: 'BOOST' | 'COSMETIC' | 'UTILITY' | 'BUNDLE';
  type: 'CONSUMABLE' | 'PERMANENT';
  price: { gems?: number; diamonds?: number };
  duration?: number;
  effect?: ItemEffect;
  image?: string;
}

export interface ItemEffect {
  type: string;
  value: number | string;
}

export interface InventoryItem {
  inventoryItemId: string;
  itemId: string;
  itemName: string;
  type: 'CONSUMABLE' | 'PERMANENT';
  status: 'UNUSED' | 'ACTIVE' | 'EXPIRED' | 'EQUIPPED';
  effect?: ItemEffect;
  purchasedAt: Date;
  activatedAt?: Date;
  expiresAt?: Date;
}

// Request extensions
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: User;
    }
  }
}
