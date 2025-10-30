import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.get('/transactions', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.post('/convert/gems-to-diamonds', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.post('/convert/diamonds-to-rtd', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.post('/withdraw', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.get('/withdrawals', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

export default router;
