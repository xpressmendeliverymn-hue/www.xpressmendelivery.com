import express from 'express';
import pool from '../database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get schedule for date range
router.get('/', async (req, res) => {
  const { dateFrom, dateTo, crew } = req.query;
  let sql = 'SELECT * FROM crew_schedule WHERE 1=1';
  const params = [];
  let idx = 1;

  if (dateFrom) {
    sql += ` AND date >= $${idx++}`;
    params.push(dateFrom);
  }
  if (dateTo) {
    sql += ` AND date <= $${idx++}`;
    params.push(dateTo);
  }
  if (crew) {
    sql += ` AND crew_name = $${idx++}`;
    params.push(crew);
  }

  sql += ' ORDER BY date, time_slot, crew_name';
  const result = await pool.query(sql, params);
  res.json(result.rows);
});

// Update slot status (admin only)
router.patch('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { status, orderId } = req.body;
  const updates = [];
  const values = [];
  let idx = 1;

  if (status) { updates.push(`status = $${idx++}`); values.push(status); }
  if (orderId !== undefined) { updates.push(`order_id = $${idx++}`); values.push(orderId); }

  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

  values.push(req.params.id);
  await pool.query(`UPDATE crew_schedule SET ${updates.join(', ')} WHERE id = $${idx}`, values);
  res.json({ message: 'Schedule updated' });
});

// Get available slots for a date
router.get('/available/:date', async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM crew_schedule WHERE date = $1 AND status = 'available' ORDER BY time_slot, crew_name
  `, [req.params.date]);
  res.json(result.rows);
});

export default router;
