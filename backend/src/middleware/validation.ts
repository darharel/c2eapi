import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      errors.array()
    );
  }
  next();
};

// Validation rules
export const registerValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  validate
];

export const verifyCodeValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Code must be 6 digits')
    .isNumeric()
    .withMessage('Code must be numeric'),
  validate
];

export const loginValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  validate
];

export const updateProfileValidation = [
  body('username').optional().isLength({ min: 3, max: 20 }),
  body('avatar').optional().isURL().withMessage('Avatar must be valid URL'),
  body('bio').optional().isLength({ max: 500 }),
  body('country').optional().isLength({ min: 2, max: 2 }),
  validate
];

export const convertGemsValidation = [
  body('gemsAmount')
    .isInt({ min: 1000 })
    .withMessage('Minimum conversion is 1000 gems')
    .custom((value) => value % 1000 === 0)
    .withMessage('Amount must be multiple of 1000'),
  validate
];

export const convertDiamondsValidation = [
  body('diamondsAmount')
    .isInt({ min: 1000 })
    .withMessage('Minimum conversion is 1000 diamonds')
    .custom((value) => value % 1000 === 0)
    .withMessage('Amount must be multiple of 1000'),
  validate
];

export const withdrawalValidation = [
  body('amount')
    .isFloat({ min: 0.1 })
    .withMessage('Minimum withdrawal is 0.1 RTD'),
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .isLength({ min: 32, max: 44 })
    .withMessage('Invalid Solana wallet address'),
  body('memo').optional().isString(),
  validate
];

export const referralCodeValidation = [
  body('referralCode')
    .matches(/^CHESS-[A-Z0-9]{6}$/)
    .withMessage('Invalid referral code format'),
  validate
];

export const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  validate
];
