import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

router.post('/:openingId/unlock', authenticateToken, (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

export default router;
