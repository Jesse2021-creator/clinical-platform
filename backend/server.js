require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const pool = require('./config/db'); // Secure PostgreSQL pool module

const app = express();

// ---------------- Security ----------------
// Set HTTP headers to secure the app
app.use(helmet());

// Enable CORS with environment-based origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Rate limiting to prevent brute-force or DoS attacks
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP
  message: 'Too many requests from this IP, please try again later.'
}));

// ---------------- Middleware ----------------
app.use(express.json()); // Parse incoming JSON
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Log requests in development
}

// ---------------- Routes ----------------
// Health check route
app.get('/', (req, res) => res.status(200).json({ message: 'Clinical Care API Running' }));

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({ dbTime: result.rows[0].now });
  } catch (err) {
    console.error('Database error:', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});