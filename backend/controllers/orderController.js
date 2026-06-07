const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  const total = await Order.countDocuments({ user: req.user._id });
  res.json({ success: true, data: { orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } } });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  res.json({ success: true, data: order });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  if (['delivered','cancelled'].includes(order.orderStatus)) {
    res.status(400); throw new Error(`Cannot cancel a ${order.orderStatus} order`);
  }
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
  order.orderStatus = 'cancelled';
  order.cancelReason = req.body.reason || 'Cancelled by user';
  order.trackingHistory.push({ status: 'cancelled', description: order.cancelReason, timestamp: new Date() });
  await order.save();
  res.json({ success: true, data: order });
});

// Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const q = {};
  if (status) q.orderStatus = status;
  if (search) q.trackingNumber = { $regex: search, $options: 'i' };
  const orders = await Order.find(q).populate('user', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  const total  = await Order.countDocuments(q);
  res.json({ success: true, data: { orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } } });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, description, location } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  order.orderStatus = status;
  order.trackingHistory.push({ status, description: description || `Status: ${status}`, location: location || '', timestamp: new Date() });
  if (status === 'delivered') {
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'cod') order.paymentStatus = 'paid';
  }
  await order.save();
  res.json({ success: true, data: order });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const [totalOrders, totalProducts, totalUsers, revenue, recentOrders] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'user' }),
    Order.aggregate([{ $match: { orderStatus: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.find().populate('user','name email').sort({ createdAt: -1 }).limit(5),
  ]);
  res.json({ success: true, data: { totalOrders, totalProducts, totalUsers, totalRevenue: revenue[0]?.total || 0, recentOrders } });
});



// This overwrites module.exports — add getAllUsers properly

const getAllUsers = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const { search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  const total = await User.countDocuments(query);
  res.json({ success: true, data: { users, pagination: { total, page:  Number(page), pages: Math.ceil(total / limit) } } });
});

module.exports = { getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus, getDashboardStats, getAllUsers };