import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pool from '../database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = express.Router();

const createSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  code: z.string().min(3, 'Code must be at least 3 characters'),
  discountPercent: z.coerce.number().min(0).max(100),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const inviteSchema = z.object({
  code: z.string().min(3),
  maxUses: z.coerce.number().min(1).max(100).default(1),
  expiresInDays: z.coerce.number().min(1).max(365).default(7),
});

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
});

// List salespeople (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  const result = await pool.query(`
    SELECT id, name, email, phone, code, discount_percent, total_referrals, total_revenue, active
    FROM users WHERE role = 'salesperson' ORDER BY name
  `);
  res.json(result.rows);
});

// Create salesperson (admin only)
router.post('/', authenticateToken, requireRole(['admin']), validateBody(createSchema), async (req, res) => {
  const { name, email, phone, code, discountPercent, password } = req.body;

  const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR code = $2', [email, code]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Email or code already exists' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const id = crypto.randomUUID();

  await pool.query(`
    INSERT INTO users (id, role, name, email, phone, password_hash, code, discount_percent, active)
    VALUES ($1, 'salesperson', $2, $3, $4, $5, $6, $7, true)
  `, [id, name, email, phone || '', hash, code, discountPercent || 10]);

  res.status(201).json({ id, message: 'Salesperson created' });
});

// Update salesperson (admin only)
router.patch('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { name, email, phone, code, discountPercent, active } = req.body;
  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
  if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email); }
  if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone); }
  if (code !== undefined) { fields.push(`code = $${idx++}`); values.push(code); }
  if (discountPercent !== undefined) { fields.push(`discount_percent = $${idx++}`); values.push(discountPercent); }
  if (active !== undefined) { fields.push(`active = $${idx++}`); values.push(active); }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  values.push(req.params.id);
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} AND role = 'salesperson'`, values);
  res.json({ message: 'Salesperson updated' });
});

// Generate invite (admin only)
router.post('/invites', authenticateToken, requireRole(['admin']), validateBody(inviteSchema), async (req, res) => {
  const { code, maxUses, expiresInDays } = req.body;
  const token = crypto.randomBytes(16).toString('hex');

  await pool.query(`
    INSERT INTO salesperson_invites (id, token, code, discount_percent, max_uses, used_count, is_active, created_by, expires_at)
    VALUES ($1, $2, $3, $4, $5, 0, true, $6, CURRENT_TIMESTAMP + INTERVAL '${expiresInDays || 7} days')
  `, [crypto.randomUUID(), token, code, 10, maxUses || 1, req.user.id]);

  res.status(201).json({ token, inviteUrl: `/signup/${token}`, message: 'Invite created' });
});

// List invites (admin only)
router.get('/invites', authenticateToken, requireRole(['admin']), async (req, res) => {
  const result = await pool.query(`
    SELECT i.*, u.name as created_by_name
    FROM salesperson_invites i
    JOIN users u ON i.created_by = u.id
    ORDER BY i.created_at DESC
  `);
  res.json(result.rows);
});

// Validate invite (public)
router.get('/invite/:token', async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM salesperson_invites
    WHERE token = $1 AND is_active = true AND used_count < max_uses AND expires_at > CURRENT_TIMESTAMP
  `, [req.params.token]);

  if (result.rows.length === 0) {
    return res.status(404).json({ valid: false, error: 'Invalid or expired invite' });
  }

  const invite = result.rows[0];
  res.json({ valid: true, token: invite.token, code: invite.code, discountPercent: invite.discount_percent });
});

// Revoke invite (admin only)
router.patch('/invites/:id/revoke', authenticateToken, requireRole(['admin']), async (req, res) => {
  await pool.query('UPDATE salesperson_invites SET is_active = false WHERE id = $1', [req.params.id]);
  res.json({ message: 'Invite revoked' });
});

// Signup via invite (public)
router.post('/signup/:token', validateBody(signupSchema), async (req, res) => {
  const { name, email, phone, password } = req.body;

  const inviteRes = await pool.query(`
    SELECT * FROM salesperson_invites
    WHERE token = $1 AND is_active = true AND used_count < max_uses AND expires_at > CURRENT_TIMESTAMP
  `, [req.params.token]);

  if (inviteRes.rows.length === 0) {
    return res.status(400).json({ error: 'Invalid or expired invite token' });
  }

  const invite = inviteRes.rows[0];

  const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR code = $2', [email, invite.code]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Email or referral code already registered' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const id = crypto.randomUUID();

  await pool.query(`
    INSERT INTO users (id, role, name, email, phone, password_hash, code, discount_percent, active)
    VALUES ($1, 'salesperson', $2, $3, $4, $5, $6, $7, true)
  `, [id, name, email, phone || '', hash, invite.code, invite.discount_percent]);

  await pool.query('UPDATE salesperson_invites SET used_count = used_count + 1 WHERE id = $1', [invite.id]);

  const token = jwt.sign(
    { id, role: 'salesperson', email, name, code: invite.code },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: { id, role: 'salesperson', name, email, phone: phone || '', code: invite.code, discountPercent: invite.discount_percent },
  });
});

// Validate referral code (public)
router.get('/validate/:code', async (req, res) => {
  const result = await pool.query(
    'SELECT name, code, discount_percent, active FROM users WHERE code = $1 AND role = $2',
    [req.params.code, 'salesperson']
  );
  const sp = result.rows[0];
  if (!sp || !sp.active) {
    return res.status(404).json({ valid: false });
  }
  res.json({ valid: true, name: sp.name, code: sp.code, discountPercent: sp.discount_percent });
});

// Get my stats (salesperson)
router.get('/me/stats', authenticateToken, requireRole(['salesperson']), async (req, res) => {
  const userResult = await pool.query('SELECT total_referrals, total_revenue, code, discount_percent FROM users WHERE id = $1', [req.user.id]);
  const user = userResult.rows[0];
  const ordersResult = await pool.query('SELECT COUNT(*) as count, COALESCE(SUM(pricing_total), 0) as revenue FROM orders WHERE affiliate_code = $1', [user.code]);

  res.json({
    code: user.code,
    discountPercent: user.discount_percent,
    totalReferrals: parseInt(ordersResult.rows[0].count),
    totalRevenue: parseFloat(ordersResult.rows[0].revenue),
  });
});

export default router;
