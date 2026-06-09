import express from 'express';
import multer from 'multer';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { extractOrderFromImage, normalizeImage } from '../services/ocr.js';

const router = express.Router();

// Use memory storage since we immediately send to AI / don't need to persist raw uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/jpg'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
    const hasAllowedMime = allowedMimes.includes(file.mimetype);
    const hasAllowedExt = allowedExts.some((ext) => file.originalname.toLowerCase().endsWith(ext));
    if (hasAllowedMime || hasAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, HEIC) are allowed'));
    }
  },
});

/**
 * POST /api/ocr/extract
 * Upload a sales order form photo → AI extracts structured data.
 */
router.post(
  '/extract',
  authenticateToken,
  requireRole(['salesperson', 'admin']),
  upload.single('form'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      const normalized = await normalizeImage(req.file.buffer, req.file.mimetype);
      const result = await extractOrderFromImage(normalized);

      if (!result.success) {
        return res.status(422).json({ error: result.error, raw: result.raw });
      }

      res.json(result);
    } catch (err) {
      console.error('[OCR Route Error]', err);
      res.status(500).json({ error: err.message || 'OCR processing failed' });
    }
  }
);

export default router;
