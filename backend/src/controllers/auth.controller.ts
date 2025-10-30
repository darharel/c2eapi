import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { generateToken, generateVerificationCode, generateReferralCode } from '../utils/helpers';
import { sendVerificationEmail, sendLoginEmail } from '../services/email.service';
import { v4 as uuidv4 } from 'uuid';

export class AuthController {
  // POST /api/auth/register
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, username } = req.body;

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id, verified FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existingUser.rows.length > 0) {
        const user = existingUser.rows[0];
        if (user.verified) {
          throw new AppError(
            existingUser.rows[0].email === email ? 'Email already exists' : 'Username already taken',
            400,
            existingUser.rows[0].email === email ? 'EMAIL_EXISTS' : 'USERNAME_TAKEN'
          );
        }
        // User exists but not verified, allow re-registration
      }

      // Generate verification code
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      let userId: string;

      if (existingUser.rows.length > 0 && !existingUser.rows[0].verified) {
        // Update existing unverified user
        userId = existingUser.rows[0].id;
        await pool.query(
          'UPDATE users SET username = $1, updated_at = NOW() WHERE id = $2',
          [username, userId]
        );
      } else {
        // Create new user
        const referralCode = generateReferralCode(username);
        const newUser = await pool.query(
          `INSERT INTO users (username, email, referral_code)
           VALUES ($1, $2, $3) RETURNING id`,
          [username, email, referralCode]
        );
        userId = newUser.rows[0].id;
      }

      // Delete any existing verification codes for this email
      await pool.query('DELETE FROM verification_codes WHERE email = $1', [email]);

      // Store verification code
      await pool.query(
        `INSERT INTO verification_codes (email, code, user_id, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [email, code, userId, expiresAt]
      );

      // Send verification email
      await sendVerificationEmail(email, code, username);

      res.status(201).json({
        success: true,
        message: 'Verification code sent to email',
        data: {
          userId,
          email,
          username,
          codeExpiresAt: expiresAt.toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/verify
  static async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, code } = req.body;

      // Find verification code
      const result = await pool.query(
        `SELECT * FROM verification_codes
         WHERE email = $1 AND code = $2 AND verified = FALSE
         ORDER BY created_at DESC LIMIT 1`,
        [email, code]
      );

      if (result.rows.length === 0) {
        throw new AppError('Invalid or expired verification code', 401, 'INVALID_CODE');
      }

      const verificationRecord = result.rows[0];

      // Check if code expired
      if (new Date() > new Date(verificationRecord.expires_at)) {
        throw new AppError('Verification code has expired', 401, 'CODE_EXPIRED');
      }

      // Check attempts
      if (verificationRecord.attempts >= 3) {
        throw new AppError('Too many failed attempts. Please request a new code', 401, 'TOO_MANY_ATTEMPTS');
      }

      // Update user as verified
      await pool.query(
        'UPDATE users SET verified = TRUE, last_login_at = NOW() WHERE id = $1',
        [verificationRecord.user_id]
      );

      // Mark code as verified
      await pool.query(
        'UPDATE verification_codes SET verified = TRUE WHERE id = $1',
        [verificationRecord.id]
      );

      // Get updated user data
      const userResult = await pool.query(
        `SELECT id, username, email, verified, gems_balance, diamonds,
                rtd_balance, knowledge_points, created_at
         FROM users WHERE id = $1`,
        [verificationRecord.user_id]
      );

      const user = userResult.rows[0];

      // Generate JWT token
      const token = generateToken(user.id);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            verified: user.verified,
            gemsBalance: user.gems_balance,
            diamonds: user.diamonds,
            rtdBalance: parseFloat(user.rtd_balance),
            knowledgePoints: user.knowledge_points,
            createdAt: user.created_at
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/resend-code
  static async resendCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      // Check if user exists
      const userResult = await pool.query(
        'SELECT id, username FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const user = userResult.rows[0];

      // Check rate limiting (1 request per 2 minutes)
      const recentCode = await pool.query(
        `SELECT * FROM verification_codes
         WHERE email = $1 AND created_at > NOW() - INTERVAL '2 minutes'
         ORDER BY created_at DESC LIMIT 1`,
        [email]
      );

      if (recentCode.rows.length > 0) {
        throw new AppError(
          'Please wait 2 minutes before requesting a new code',
          429,
          'RATE_LIMIT_EXCEEDED'
        );
      }

      // Generate new code
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Invalidate old codes
      await pool.query('DELETE FROM verification_codes WHERE email = $1', [email]);

      // Insert new code
      await pool.query(
        `INSERT INTO verification_codes (email, code, user_id, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [email, code, user.id, expiresAt]
      );

      // Send email
      await sendVerificationEmail(email, code, user.username);

      res.status(200).json({
        success: true,
        message: 'New verification code sent',
        data: {
          email,
          codeExpiresAt: expiresAt.toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/login
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      // Check if user exists
      const userResult = await pool.query(
        'SELECT id, username, verified FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const user = userResult.rows[0];

      if (!user.verified) {
        throw new AppError('Email not verified. Please complete registration', 400, 'EMAIL_NOT_VERIFIED');
      }

      // Generate verification code
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Delete old codes
      await pool.query('DELETE FROM verification_codes WHERE email = $1', [email]);

      // Insert new code
      await pool.query(
        `INSERT INTO verification_codes (email, code, user_id, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [email, code, user.id, expiresAt]
      );

      // Send login email
      await sendLoginEmail(email, code);

      res.status(200).json({
        success: true,
        message: 'Verification code sent to email',
        data: {
          userId: user.id,
          email,
          codeExpiresAt: expiresAt.toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/refresh
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        throw new AppError('Token required', 401, 'MISSING_TOKEN');
      }

      // Verify existing token (even if expired)
      const decoded = require('jsonwebtoken').decode(token) as { userId: string } | null;

      if (!decoded || !decoded.userId) {
        throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
      }

      // Check if user exists
      const userResult = await pool.query(
        'SELECT id FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        throw new AppError('User not found', 401, 'USER_NOT_FOUND');
      }

      // Generate new token
      const newToken = generateToken(decoded.userId);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      res.status(200).json({
        success: true,
        data: {
          token: newToken,
          expiresAt: expiresAt.toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
