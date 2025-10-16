const express = require('express');
const router = express.Router();
const { pool } = require('../app');
const authMiddleware = require('../middleware/auth');

// GET the user's shopping cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `
      SELECT
        ci.id as cart_item_id, ci.quantity,
        p.id as product_id, p.name, p.price, p.stock_quantity
      FROM carts c
      JOIN cart_items ci ON c.id = ci.cart_id
      JOIN products p ON ci.product_id = p.id
      WHERE c.user_id = $1
      `,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST to add an item to the cart
router.post('/add', authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    let cartResult = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    let cartId;

    if (cartResult.rows.length === 0) {
      const newCartResult = await pool.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
        [userId]
      );
      cartId = newCartResult.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }

    const cartItemResult = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );

    if (cartItemResult.rows.length > 0) {
      const newQuantity = cartItemResult.rows[0].quantity + quantity;
      await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2',
        [newQuantity, cartItemResult.rows[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cartId, productId, quantity]
      );
    }

    res.status(200).json({ message: 'Item added to cart successfully.' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// DELETE to remove an item from the cart
router.delete('/:cartItemId', authMiddleware, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `
      DELETE FROM cart_items
      WHERE id = $1 AND cart_id = (SELECT id FROM carts WHERE user_id = $2)
      RETURNING *;
      `,
      [cartItemId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found or does not belong to user.' });
    }

    res.status(200).json({ message: 'Item removed from cart successfully.' });
  } catch (error) {
    console.error('Error deleting from cart:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;