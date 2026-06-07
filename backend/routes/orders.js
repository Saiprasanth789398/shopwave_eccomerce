const express = require('express');
const router  = express.Router();
const {
  getMyOrders, getOrder, cancelOrder,
  getAllOrders, updateOrderStatus, getDashboardStats
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

// User routes
router.get('/my',              getMyOrders);
router.get('/:id',             getOrder);
router.put('/:id/cancel',      cancelOrder);

// Admin routes
router.get('/admin/all',       adminOnly, getAllOrders);
router.put('/admin/:id/status',adminOnly, updateOrderStatus);
router.get('/admin/dashboard', adminOnly, getDashboardStats);

module.exports = router;
