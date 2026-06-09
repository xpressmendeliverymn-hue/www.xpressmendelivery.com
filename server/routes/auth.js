import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import pool from '../database.js';
import { validateBody } from '../middleware/validate.js';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

const registerSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Login
router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!user.active) {
    return res.status(403).json({ error: 'Account deactivated' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name, code: user.code },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      code: user.code,
      discountPercent: user.discount_percent,
    },
  });
});

// Get current user
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      code: user.code,
      discountPercent: user.discount_percent,
    });
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
});

// Register customer
router.post('/register', validateBody(registerSchema), async (req, res) => {
  const { name, email, phone, password } = req.body;

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const id = crypto.randomUUID();

  await pool.query(`
    INSERT INTO users (id, role, name, email, phone, password_hash)
    VALUES ($1, 'customer', $2, $3, $4, $5)
  `, [id, name, email, phone || '', hash]);

  const token = jwt.sign(
    { id, role: 'customer', email, name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: { id, role: 'customer', name, email, phone: phone || '' },
  });
});

export default router;
