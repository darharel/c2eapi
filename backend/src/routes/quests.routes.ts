import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.post('/:questId/complete', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.get('/daily', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.post('/daily/:missionId/complete', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.get('/weekly', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

export default router;
