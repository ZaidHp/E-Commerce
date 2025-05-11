const express = require('express');
const router = express.Router();
const payfastService = require('../services/payfastService');
const db = require('../db');

// Initiate PayFast payment
router.post('/initiate', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Fetch order from database
    const [order] = await db.query(`
      SELECT o.*, u.first_name, u.last_name, u.email, b.business_name 
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      JOIN businesses b ON o.business_id = b.business_id
      WHERE o.order_id = ?
    `, [orderId]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const paymentData = payfastService.generatePaymentData({
      orderId: order.order_id,
      amount: order.total_amount,
      user: {
        firstName: order.first_name,
        lastName: order.last_name,
        email: order.email
      },
      businessName: order.business_name
    });

    res.json(paymentData);
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// PayFast ITN (Instant Transaction Notification) handler
router.post('/notify', express.urlencoded({ extended: false }), async (req, res) => {
  try {
    // Verify the signature
    const signatureData = Object.keys(req.body)
      .filter(key => key !== 'signature')
      .map(key => `${key}=${encodeURIComponent(req.body[key].toString().trim())}`)
      .join('&');

    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const calculatedSignature = crypto.createHash('md5')
      .update(`${signatureData}${passphrase ? `&passphrase=${passphrase}` : ''}`)
      .digest('hex');
    
    if (calculatedSignature !== req.body.signature) {
      return res.status(400).send('Invalid signature');
    }

    // Extract payment details
    const orderId = req.body.m_payment_id;
    const paymentStatus = req.body.payment_status;
    const amount = parseFloat(req.body.amount_gross);

    // Verify order exists and amount matches
    const [order] = await db.query(`
      SELECT order_id, total_amount 
      FROM orders 
      WHERE order_id = ?
    `, [orderId]);

    if (!order.length) return res.status(404).send('Order not found');
    if (amount !== parseFloat(order[0].total_amount)) {
      return res.status(400).send('Amount mismatch');
    }

    // Update order status based on payment status
    let newStatus;
    switch (paymentStatus) {
      case 'COMPLETE':
        newStatus = 'paid';
        break;
      case 'FAILED':
        newStatus = 'payment_failed';
        break;
      case 'CANCELLED':
        newStatus = 'cancelled';
        break;
      default:
        return res.status(400).send('Unknown payment status');
    }

    await db.query(`
      UPDATE orders 
      SET payment_status = ?, 
          order_status = ?,
          payment_date = NOW() 
      WHERE order_id = ?
    `, [paymentStatus.toLowerCase(), newStatus, orderId]);

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayFast ITN error:', error);
    res.status(500).send('Error processing payment');
  }
});

module.exports = router;