const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image:    { type: String, default: '' },
});

const trackingSchema = new mongoose.Schema({
  status:      { type: String, required: true },
  description: { type: String, default: '' },
  location:    { type: String, default: '' },
  timestamp:   { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems:  [orderItemSchema],
    shippingAddress: {
      name:    { type: String, required: true },
      phone:   { type: String, required: true },
      street:  { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    // ── Payment ──────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      required: true,
      enum: ['razorpay', 'cod'],   // razorpay = online payment
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    // Razorpay specific IDs — filled after payment verified
    razorpayOrderId:   { type: String, default: '' }, // created by backend before checkout
    razorpayPaymentId: { type: String, default: '' }, // sent by Razorpay after user pays
    razorpaySignature: { type: String, default: '' }, // verified by backend
    paidAt:            { type: Date },
    // ─────────────────────────────────────────────────────────────────

    itemsPrice:   { type: Number, required: true, default: 0 },
    taxPrice:     { type: Number, required: true, default: 0 },
    shippingPrice:{ type: Number, required: true, default: 0 },
    totalPrice:   { type: Number, required: true, default: 0 },

    orderStatus: {
      type: String,
      enum: ['processing','confirmed','shipped','out_for_delivery','delivered','cancelled','returned'],
      default: 'processing',
    },
    trackingHistory: [trackingSchema],
    trackingNumber:  { type: String, default: '' },
    estimatedDelivery: { type: Date },
    deliveredAt:     { type: Date },
    cancelReason:    { type: String, default: '' },
    notes:           { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
