import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/items', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.post('/purchase', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.get('/inventory', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.post('/use', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

export default router;
