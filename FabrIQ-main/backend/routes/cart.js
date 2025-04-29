const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    console.log('Authenticating token...');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWTPRIVATEKEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  const { productId, quantity, size, colorId } = req.body;
  const userId = req.user.id;

  try {
    // Validate input
    if (!productId || !quantity || !size) {
      return res.status(400).json({ message: 'Product ID, quantity, and size are required' });
    }

    // Check if product exists and get size_id
    const [productSizes] = await db.query(`
      SELECT s.size_id 
      FROM product_size s
      JOIN products p ON s.product_id = p.product_id
      WHERE p.product_id = ? AND s.size = ?
      ${colorId ? 'AND s.color_id = ?' : ''}
    `, colorId ? [productId, size, colorId] : [productId, size]);

    if (productSizes.length === 0) {
      return res.status(404).json({ message: 'Product size not found' });
    }

    const sizeId = productSizes[0].size_id;

    // Check if user has an existing cart
    const [userCart] = await db.query('SELECT cart_id FROM cart WHERE user_id = ?', [userId]);

    let cartId;
    if (userCart.length === 0) {
      // Create new cart if user doesn't have one
      const [result] = await db.query('INSERT INTO cart (user_id) VALUES (?)', [userId]);
      cartId = result.insertId;
    } else {
      cartId = userCart[0].cart_id;
    }

    // Check if item already exists in cart
    const [existingItem] = await db.query(`
      SELECT cart_item_id, quantity 
      FROM cart_items 
      WHERE cart_id = ? AND size_id = ?
    `, [cartId, sizeId]);

    if (existingItem.length > 0) {
      // Update quantity if item exists
      const newQuantity = existingItem[0].quantity + quantity;
      await db.query(`
        UPDATE cart_items 
        SET quantity = ? 
        WHERE cart_item_id = ?
      `, [newQuantity, existingItem[0].cart_item_id]);
    } else {
      // Add new item to cart
      await db.query(`
        INSERT INTO cart_items (cart_id, size_id, quantity) 
        VALUES (?, ?, ?)
      `, [cartId, sizeId, quantity]);
    }

    res.status(200).json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
});

module.exports = router;