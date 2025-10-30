import jwt, { SignOptions } from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const payload = { userId };
  const secret = process.env.JWT_SECRET!;
  const expiresIn = (process.env.JWT_EXPIRES_IN || '30d') as string;

  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateReferralCode = (username: string): string => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CHESS-${random}`;
};

export const calculateWithdrawalFee = (amount: number): number => {
  const feePercentage = 0.001; // 0.1%
  const minFee = 0.001; // Minimum 0.001 RTD
  const calculatedFee = amount * feePercentage;
  return Math.max(calculatedFee, minFee);
};

export const isValidSolanaAddress = (address: string): boolean => {
  // Basic Solana address validation (base58, 32-44 chars)
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaAddressRegex.test(address);
};
