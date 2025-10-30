import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/global', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.get('/friends', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.get('/rank', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.get('/top', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

export default router;
