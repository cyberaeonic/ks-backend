// Payment Controller - Razorpay order creation
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

// Lazily require Razorpay only when actually used
function getRazorpay(keyId, keySecret) {
  try {
    const Razorpay = require('razorpay');
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
  } catch (e) {
    return null;
  }
}

// POST /api/payment/create-order
// Creates a Razorpay order so that frontend can open the payment popup
async function createRazorpayOrder(req, res) {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || isNaN(amount) || amount < 1) {
      return res.status(400).json({ error: 'Valid amount in paise is required.' });
    }

    // Get Razorpay keys from store settings
    const settings = await prisma.store_settings.findFirst();
    if (!settings || !settings.razorpayEnabled) {
      return res.status(403).json({ error: 'Razorpay payments are not enabled for this store.' });
    }

    const keyId = settings.razorpayKey;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ error: 'Razorpay credentials are not configured on the server.' });
    }

    const razorpay = getRazorpay(keyId, keySecret);
    if (!razorpay) {
      return res.status(500).json({ error: 'Razorpay SDK not installed. Run: npm install razorpay' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount), // amount in paise
      currency,
      receipt: receipt || ('order_' + Date.now()),
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    return res.status(500).json({ error: 'Failed to create payment order.' });
  }
}

// POST /api/payment/verify
// Verify Razorpay payment signature after successful payment
async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ error: 'Payment verification not configured.' });
    }

    const expectedSig = crypto
      .createHmac('sha256', keySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Payment signature verification failed.' });
    }

    return res.json({ success: true, paymentId: razorpay_payment_id });
  } catch (err) {
    console.error('Payment verify error:', err);
    return res.status(500).json({ error: 'Payment verification failed.' });
  }
}

module.exports = { createRazorpayOrder, verifyPayment };
