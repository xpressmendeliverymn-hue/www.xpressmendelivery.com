import express from 'express';
import pool from '../database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM furniture_catalog ORDER BY category, name');
  res.json(result.rows);
});

router.get('/category/:category', async (req, res) => {
  const result = await pool.query('SELECT * FROM furniture_catalog WHERE category = $1', [req.params.category]);
  res.json(result.rows);
});

export default router;
