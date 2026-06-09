import express from 'express';
import pool from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get my notifications
router.get('/', authenticateToken, async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50
  `, [req.user.id]);
  res.json(result.rows);
});

// Mark as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  await pool.query('UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
  res.json({ message: 'Marked as read' });
});

// Mark all as read
router.post('/read-all', authenticateToken, async (req, res) => {
  await pool.query('UPDATE notifications SET read = true WHERE user_id = $1', [req.user.id]);
  res.json({ message: 'All marked as read' });
});

// Unread count
router.get('/count', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false', [req.user.id]);
  res.json({ count: parseInt(result.rows[0].count) });
});

export default router;
