import express from 'express';
import pool from '../database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM store_locations ORDER BY brand, city');
  res.json(result.rows);
});

router.get('/brand/:brand', async (req, res) => {
  const result = await pool.query('SELECT * FROM store_locations WHERE brand = $1', [req.params.brand]);
  res.json(result.rows);
});

export default router;
