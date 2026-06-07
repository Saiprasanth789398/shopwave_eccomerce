const asyncHandler = require('express-async-handler');
const Cart    = require('../models/Cart');
const Product = require('../models/Product');

const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price images stock isActive');
  if (!cart) return res.json({ success: true, data: { items: [], totalPrice: 0 } });
  const totalPrice = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  res.json({ success: true, data: { ...cart.toObject(), totalPrice } });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product?.isActive) { res.status(404); throw new Error('Product not found'); }
  if (product.stock < quantity) { res.status(400); throw new Error(`Only ${product.stock} in stock`); }

  let cart = await Cart.findOne({ user: req.user._id }) || new Cart({ user: req.user._id, items: [] });
  const existing = cart.items.find(i => i.product.toString() === productId);

  if (existing) {
    if (existing.quantity + quantity > product.stock) { res.status(400); throw new Error(`Max ${product.stock} allowed`); }
    existing.quantity += quantity;
    existing.price = product.price;
  } else {
    cart.items.push({ product: productId, quantity, price: product.price });
  }

  await cart.save();
  await cart.populate('items.product', 'name price images stock');
  const totalPrice = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  res.json({ success: true, data: { ...cart.toObject(), totalPrice } });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error('Cart not found'); }
  const item = cart.items.find(i => i.product.toString() === req.params.productId);
  if (!item) { res.status(404); throw new Error('Item not in cart'); }
  if (quantity <= 0) {
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
  } else {
    item.quantity = quantity;
  }
  await cart.save();
  await cart.populate('items.product', 'name price images stock');
  const totalPrice = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  res.json({ success: true, data: { ...cart.toObject(), totalPrice } });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error('Cart not found'); }
  cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json({ success: true, message: 'Item removed' });
});

const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
