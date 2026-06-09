import express from 'express';
import crypto from 'crypto';
import pool from '../database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get messages for an order
router.get('/order/:orderId', authenticateToken, async (req, res) => {
  const orderId = req.params.orderId;

  // Check access
  const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  const order = orderRes.rows[0];
  if (!order) return res.status(404).json({ error: 'Order not found' });

  // Salespeople can only see their own orders
  if (req.user.role === 'salesperson' && order.salesperson_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const result = await pool.query(`
    SELECT * FROM order_messages
    WHERE order_id = $1
    ORDER BY created_at ASC
  `, [orderId]);

  res.json(result.rows);
});

// Send a message on an order
router.post('/order/:orderId', authenticateToken, async (req, res) => {
  const orderId = req.params.orderId;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Check access
  const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  const order = orderRes.rows[0];
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (req.user.role === 'salesperson' && order.salesperson_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const result = await pool.query(`
    INSERT INTO order_messages (id, order_id, sender_id, sender_name, sender_role, message, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [
    crypto.randomUUID(), orderId, req.user.id, req.user.name, req.user.role,
    message.trim(), new Date().toISOString(),
  ]);

  res.status(201).json(result.rows[0]);
});

export default router;
