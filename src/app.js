const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const logger = require('./middleware/logger');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: '*', // Allows requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(logger);

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Database connected successfully.');
});

// Import routes
const usersRoutes = require('./routes/users');
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');

// Mount routes
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', ordersRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the E-commerce API!');
});

// Export the app and the database pool
module.exports = { app, pool };
