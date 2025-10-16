const express = require('express');
const router = express.Router();
const { pool } = require('../app');
const authMiddleware = require('../middleware/auth');

// POST to checkout
router.post('/checkout', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start a transaction

    // 1. Get all items from the user's cart
    const cartResult = await client.query(
      `
      SELECT ci.product_id, ci.quantity, p.price, p.stock_quantity
      FROM carts c
      JOIN cart_items ci ON c.id = ci.cart_id
      JOIN products p ON ci.product_id = p.id
      WHERE c.user_id = $1
      `,
      [userId]
    );
    const cartItems = cartResult.rows;

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // 2. Calculate the total and check for sufficient stock
    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.quantity > item.stock_quantity) {
        await client.query('ROLLBACK'); // Roll back the transaction
        return res.status(400).json({ message: `Insufficient stock for product ${item.product_id}.` });
      }
      totalAmount += item.price * item.quantity;
    }

    // 3. Create a new order
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING id',
      [userId, totalAmount, 'pending']
    );
    const orderId = orderResult.rows[0].id;

    // 4. Move items from cart to order_items and update product stock
    for (const item of cartItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
        [orderId, item.product_id, item.quantity]
      );
      // Decrement product stock
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // 5. Clear the user's cart
    await client.query('DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)', [userId]);

    await client.query('COMMIT'); // Commit the transaction
    res.status(201).json({ message: 'Order placed successfully!', orderId });
  } catch (error) {
    await client.query('ROLLBACK'); // Roll back on any error
    console.error('Error during checkout:', error);
    res.status(500).json({ message: 'Internal server error.' });
  } finally {
    client.release();
  }
});

module.exports = router;
