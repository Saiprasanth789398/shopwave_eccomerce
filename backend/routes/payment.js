const express = require('express');
const router  = express.Router();
const { createRazorpayOrder, verifyAndPlaceOrder, placeCODOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect); // all payment routes need login

router.post('/create-order', createRazorpayOrder); // STEP 1 — create Razorpay order
router.post('/verify',       verifyAndPlaceOrder); // STEP 3 — verify + save to DB
router.post('/cod',          placeCODOrder);       // Cash on delivery

module.exports = router;
