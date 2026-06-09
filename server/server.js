import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { initDatabase } from './database.js';

import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import salespeopleRoutes from './routes/salespeople.js';
import scheduleRoutes from './routes/schedule.js';
import notificationRoutes from './routes/notifications.js';
import uploadRoutes from './routes/upload.js';
import catalogRoutes from './routes/catalog.js';
import storeRoutes from './routes/stores.js';
import ocrRoutes from './routes/ocr.js';
import messageRoutes from './routes/messages.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const corsOrigin = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL || 'https://xpressmendelivery.com',
      'https://xpressmendelivery.com',
      'https://www.xpressmendelivery.com',
    ].filter(Boolean)
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'];

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please slow down' },
});

app.use(generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Request logging in dev
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/salespeople', salespeopleRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} ERROR:`, err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Initialize DB and start
initDatabase().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Xpressmen server running on port ${PORT}`);
    console.log(`CORS allowed origins:`, corsOrigin);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => process.exit(0));
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
