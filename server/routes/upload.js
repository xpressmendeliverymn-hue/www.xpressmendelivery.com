import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const router = express.Router();

function getBaseUrl(req) {
  const host = req.get('x-forwarded-host') || req.get('host');
  const protocol = req.get('x-forwarded-proto') || req.protocol;
  return `${protocol}://${host}`;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = crypto.randomUUID() + path.extname(file.originalname);
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP images allowed'));
  },
});

// Upload single image
router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const url = `${getBaseUrl(req)}/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// Upload multiple images
router.post('/images', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const urls = req.files.map(f => `${getBaseUrl(req)}/uploads/${f.filename}`);
  res.json({ urls });
});

export default router;
