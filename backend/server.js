require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

connectDB();
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/payment',  require('./routes/payment'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/reviews',  require('./routes/reviews'));

// Admin shortcuts
const { protect, adminOnly } = require('./middleware/auth');
const { getDashboardStats, getAllOrders, updateOrderStatus, getAllUsers } = require('./controllers/orderController');
app.get('/api/admin/dashboard',           protect, adminOnly, getDashboardStats);
app.get('/api/admin/orders',              protect, adminOnly, getAllOrders);
app.put('/api/admin/orders/:id/status',   protect, adminOnly, updateOrderStatus);
app.get('/api/admin/users',               protect, adminOnly, getAllUsers);

app.get('/api/health', (_, res) => res.json({ ok: true, message: 'Server running' }));
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
