const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const User    = require('../models/User');
const asyncHandler = require('express-async-handler');

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price images ratings stock isActive');
  res.json({ success: true, data: user.wishlist.filter(p => p.isActive) });
}));

router.put('/:productId/toggle', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const id   = req.params.productId;
  const has  = user.wishlist.some(i => i.toString() === id);
  if (has) user.wishlist = user.wishlist.filter(i => i.toString() !== id);
  else     user.wishlist.push(id);
  await user.save();
  res.json({ success: true, message: has ? 'Removed' : 'Added', data: { isWishlisted: !has } });
}));

router.delete('/:productId', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter(i => i.toString() !== req.params.productId);
  await user.save();
  res.json({ success: true, message: 'Removed' });
}));

module.exports = router;
