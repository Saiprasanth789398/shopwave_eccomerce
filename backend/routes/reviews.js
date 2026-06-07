const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const Review  = require('../models/Review');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

router.get('/:productId', asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId }).populate('user','name avatar').sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, data: { reviews } });
}));

router.post('/:productId', protect, asyncHandler(async (req, res) => {
  const { rating, comment, title } = req.body;
  const review = await Review.create({ user: req.user._id, product: req.params.productId, rating, comment, title });
  await review.populate('user','name avatar');
  res.status(201).json({ success: true, data: review });
}));

router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const r = await Review.findById(req.params.id);
  if (!r) { res.status(404); throw new Error('Not found'); }
  if (r.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') { res.status(403); throw new Error('Not authorized'); }
  await Review.findByIdAndDelete(req.params.id);
  res.json({ success: true });
}));

module.exports = router;
