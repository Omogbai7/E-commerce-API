const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../app'); // Import the database pool
const authMiddleware = require('../middleware/auth'); // Import our new middleware

router.post('/register', async (req, res) => {
  
});

router.post('/login', async (req, res) => {
 
});

router.get('/me', authMiddleware, async (req, res) => {
  
  try {
    // We can use the user's ID from the decoded token to query the database
    const userQuery = 'SELECT id, name, email, role FROM users WHERE id = $1';
    const result = await pool.query(userQuery, [req.user.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
