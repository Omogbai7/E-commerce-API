const express = require('express');
const router = express.Router();
const { pool } = require('../app');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// --------------------- Public Routes (Anyone can view products) ---------------------

// GET all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// --------------------- Admin-Only Routes (Protected) ---------------------

// POST to create a new product (Auth and Admin required)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, stock_quantity } = req.body;
    const query = `
      INSERT INTO products (name, description, price, stock_quantity)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [name, description, price, stock_quantity];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT to update a product (Auth and Admin required)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock_quantity } = req.body;
    const query = `
      UPDATE products
      SET name = $1, description = $2, price = $3, stock_quantity = $4
      WHERE id = $5
      RETURNING *;
    `;
    const values = [name, description, price, stock_quantity, id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// DELETE a product (Auth and Admin required)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;