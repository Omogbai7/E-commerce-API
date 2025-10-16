const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(express.json()); // This middleware allows us to parse JSON body from requests

// Set up a PostgreSQL connection pool
const pool = new Pool({
  user: 'mark',
  host: 'localhost',
  database: 'ecommerce',
  password: '123456789',
  port: 5432,
});

const PORT = process.env.PORT || 3000;

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Database connected successfully:', res.rows[0].now);
});

// User registration endpoint
app.post('/api/v1/users/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Insert the new user into the database
    const query = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, 'customer')
      RETURNING id, name, email, role;
    `;
    const values = [name, email, hashedPassword];
    const result = await pool.query(query, values);
    const newUser = result.rows[0];

    // 3. Respond with the new user's details (excluding the password hash)
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'User with that email already exists.' });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// A simple root endpoint to confirm the server is running
app.get('/', (req, res) => {
  res.send('Welcome to the E-commerce API!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
