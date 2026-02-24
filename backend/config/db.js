// db.js
// Production-grade PostgreSQL connection using pg Pool
// Securely reads credentials from environment variables

const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

// Create a pool of connections
const pool = new Pool({
  user: process.env.DB_USER,            // e.g., 'clinical_admin'
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,        // e.g., 'clinical_platform'
  password: process.env.DB_PASSWORD,    // from .env
  port: process.env.DB_PORT || 5432,
  max: 20,                              // Maximum number of connections in pool
  idleTimeoutMillis: 30000,             // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000,        // Return an error after 2 seconds if connection fails
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false, // Enable SSL in production
});

// Test connection at startup
pool.connect()
  .then(client => {
    console.log('PostgreSQL connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('PostgreSQL connection error:', err.stack);
    process.exit(1); // Exit process if database connection fails
  });

module.exports = pool;