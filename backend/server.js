require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== CONECTAR MONGODB =====
connectDB();

// ===== SEGURIDAD: CORS =====
const corsOptions = {
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// ===== SEGURIDAD: HEADERS HTTP =====
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' fonts.googleapis.com fonts.gstatic.com; img-src 'self' data:;");
  next();
});

// ===== SEGURIDAD: RATE LIMITING MANUAL =====
const requestCounts = new Map();
const RATE_LIMIT = 20;      // máx requests
const RATE_WINDOW = 60000;  // por minuto

app.use('/api/auth', (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const entry = requestCounts.get(ip) || { count: 0, start: now };

  if (now - entry.start > RATE_WINDOW) {
    entry.count = 1;
    entry.start = now;
  } else {
    entry.count++;
  }

  requestCounts.set(ip, entry);

  if (entry.count > RATE_LIMIT) {
    return res.status(429).json({
      ok: false,
      mensaje: 'Demasiadas solicitudes. Espera un momento antes de intentar de nuevo.'
    });
  }
  next();
});

// ===== MIDDLEWARES =====
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ===== ARCHIVOS ESTÁTICOS =====
app.use(express.static(path.join(__dirname, '../frontend')));

// ===== RUTAS API =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ticker', require('./routes/ticker'));

// ===== FALLBACK =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
});

app.listen(PORT, () => {
  console.log(`🫧 Bubbly corriendo en http://localhost:${PORT}`);
});