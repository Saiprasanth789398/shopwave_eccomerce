const asyncHandler = require('express-async-handler');
const crypto   = require('crypto');
const Cart     = require('../models/Cart');
const Order    = require('../models/Order');
const Product  = require('../models/Product');

// Load Razorpay lazily — gives a clear error if package not installed
const getRazorpay = () => {
  try {
    return require('../config/razorpay');
  } catch (e) {
    throw new Error('Razorpay package not installed. Run: npm install razorpay');
  }
};

// ── helpers ──────────────────────────────────────────────────
const calcPrices = (items) => {
  const itemsPrice    = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxPrice      = Math.round(itemsPrice * 0.18 * 100) / 100;
  const shippingPrice = itemsPrice > 500 ? 0 : 50;
  const totalPrice    = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;
  return { itemsPrice, taxPrice, shippingPrice, totalPrice };
};

const validateStock = (items) => {
  for (const item of items) {
    if (!item.product || !item.product.isActive) {
      throw new Error(`"${item.product?.name || 'A product'}" is no longer available`);
    }
    if (item.product.stock < item.quantity) {
      throw new Error(`Only ${item.product.stock} units left for "${item.product.name}"`);
    }
  }
};

// ─────────────────────────────────────────────────────────────
//  STEP 1 — Create Razorpay order
//  POST /api/payment/create-order
// ─────────────────────────────────────────────────────────────
const createRazorpayOrder = asyncHandler(async (req, res) => {
  // Get cart
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name price images stock isActive');

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty. Add items before checkout.');
  }

  validateStock(cart.items);

  const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(cart.items);

  // Amount in paise (₹1 = 100 paise)
  const amountPaise = Math.round(totalPrice * 100);

  // Create order on Razorpay
  let rzpOrder;
  try {
    const razorpay = getRazorpay();
    console.log(process.env.RAZORPAY_KEY_ID);
    console.log(process.env.RAZORPAY_KEY_SECRET);
    rzpOrder = await razorpay.orders.create({
      amount:   amountPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    });
  } catch (err) {
  console.error('FULL ERROR =>');
  console.dir(err, { depth: null });

  if (err.error) {
    console.log('RAZORPAY ERROR:', err.error);
  }

  }

  res.status(201).json({
    success: true,
    data: {
      razorpayOrderId: rzpOrder.id,
      amount:          rzpOrder.amount,
      currency:        'INR',
      keyId:           process.env.RAZORPAY_KEY_ID,
      breakdown:       { itemsPrice, taxPrice, shippingPrice, totalPrice },
    },
  });
});

// ─────────────────────────────────────────────────────────────
//  STEP 3 — Verify payment + save order
//  POST /api/payment/verify
// ─────────────────────────────────────────────────────────────
const verifyAndPlaceOrder = asyncHandler(async (req, res) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    shippingAddress,
    notes,
  } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    res.status(400);
    throw new Error('Missing payment details. Please try again.');
  }

  // Verify HMAC signature
  const hmac = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (hmac !== razorpaySignature) {
    res.status(400);
    throw new Error('Payment verification failed. Invalid signature.');
  }

  // Get cart again
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name price images stock isActive');

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty. Cannot place order.');
  }

  validateStock(cart.items);

  const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(cart.items);

  // Create order in MongoDB
  const order = await Order.create({
    user: req.user._id,
    orderItems: cart.items.map((i) => ({
      product:  i.product._id,
      name:     i.product.name,
      price:    i.price,
      quantity: i.quantity,
      image:    i.product.images?.[0]?.url || '',
    })),
    shippingAddress,
    paymentMethod:     'razorpay',
    paymentStatus:     'paid',
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    paidAt:            new Date(),
    itemsPrice, taxPrice, shippingPrice, totalPrice,
    trackingNumber:    'TRK' + Date.now(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    trackingHistory: [{
      status:      'processing',
      description: 'Payment received via Razorpay. Order confirmed.',
      timestamp:   new Date(),
    }],
    notes: notes || '',
  });

  // Reduce stock
  for (const i of cart.items) {
    await Product.findByIdAndUpdate(i.product._id, { $inc: { stock: -i.quantity } });
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.status(201).json({
    success: true,
    message: 'Payment verified! Order placed successfully.',
    data: { orderId: order._id, trackingNumber: order.trackingNumber },
  });
});

// ─────────────────────────────────────────────────────────────
//  COD — Cash on Delivery
//  POST /api/payment/cod
// ─────────────────────────────────────────────────────────────
const placeCODOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, notes } = req.body;

  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name price images stock isActive');

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  validateStock(cart.items);

  const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(cart.items);

  const order = await Order.create({
    user: req.user._id,
    orderItems: cart.items.map((i) => ({
      product:  i.product._id,
      name:     i.product.name,
      price:    i.price,
      quantity: i.quantity,
      image:    i.product.images?.[0]?.url || '',
    })),
    shippingAddress,
    paymentMethod:  'cod',
    paymentStatus:  'pending',
    itemsPrice, taxPrice, shippingPrice, totalPrice,
    trackingNumber:    'TRK' + Date.now(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    trackingHistory: [{
      status:      'processing',
      description: 'COD order placed successfully.',
      timestamp:   new Date(),
    }],
    notes: notes || '',
  });

  for (const i of cart.items) {
    await Product.findByIdAndUpdate(i.product._id, { $inc: { stock: -i.quantity } });
  }

  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.status(201).json({
    success: true,
    message: 'COD order placed!',
    data: { orderId: order._id, trackingNumber: order.trackingNumber },
  });
});

module.exports = { createRazorpayOrder, verifyAndPlaceOrder, placeCODOrder };