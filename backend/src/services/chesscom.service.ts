import axios from 'axios';

const CHESSCOM_API_BASE = 'https://api.chess.com/pub';

export interface ChessComProfile {
  username: string;
  playerId: number;
  title?: string;
  status: string;
  name?: string;
  avatar?: string;
  location?: string;
  country: string;
  joined: number;
  lastOnline: number;
  followers: number;
  isStreamer: boolean;
  verified: boolean;
}

export interface ChessComStats {
  chess_daily?: any;
  chess_rapid?: any;
  chess_blitz?: any;
  chess_bullet?: any;
}

export interface ChessComGame {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  accuracies?: {
    white?: number;
    black?: number;
  };
  white: {
    username: string;
    rating: number;
    result: string;
  };
  black: {
    username: string;
    rating: number;
    result: string;
  };
}

export const getChessComProfile = async (username: string): Promise<ChessComProfile> => {
  try {
    const response = await axios.get(`${CHESSCOM_API_BASE}/player/${username}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Chess.com user not found');
    }
    throw new Error('Failed to fetch Chess.com profile');
  }
};

export const getChessComStats = async (username: string): Promise<ChessComStats> => {
  try {
    const response = await axios.get(`${CHESSCOM_API_BASE}/player/${username}/stats`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch Chess.com stats');
  }
};

export const getChessComGames = async (username: string, year: number, month: number): Promise<ChessComGame[]> => {
  try {
    const monthStr = month.toString().padStart(2, '0');
    const response = await axios.get(
      `${CHESSCOM_API_BASE}/player/${username}/games/${year}/${monthStr}`
    );
    return response.data.games || [];
  } catch (error) {
    throw new Error('Failed to fetch Chess.com games');
  }
};

export const verifyChessComLocation = async (username: string, verificationCode: string): Promise<boolean> => {
  try {
    const profile = await getChessComProfile(username);
    return profile.location?.includes(verificationCode) || false;
  } catch (error) {
    return false;
  }
};
