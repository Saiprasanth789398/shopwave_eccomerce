const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12, featured } = req.query;
  const query = { isActive: true };
  if (keyword) query.$text = { $search: keyword };
  if (category && category !== 'all') query.category = category;
  if (minPrice || maxPrice) { query.price = {}; if (minPrice) query.price.$gte = Number(minPrice); if (maxPrice) query.price.$lte = Number(maxPrice); }
  if (featured === 'true') query.isFeatured = true;

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc')  sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };
  if (sort === 'rating')     sortOption = { 'ratings.average': -1 };

  const total    = await Product.countDocuments(query);
  const products = await Product.find(query).sort(sortOption).skip((page - 1) * limit).limit(Number(limit));

  res.json({ success: true, data: { products, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } } });
});

const getProduct    = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p || !p.isActive) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, data: p });
});

const getFeatured   = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true }).limit(8);
  res.json({ success: true, data: products });
});

const getCategories = asyncHandler(async (req, res) => {
  const cats = await Product.distinct('category', { isActive: true });
  res.json({ success: true, data: cats });
});

const createProduct = asyncHandler(async (req, res) => {
  const p = await Product.create(req.body);
  res.status(201).json({ success: true, data: p });
});

const updateProduct = asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!p) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, data: p });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!p) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, message: 'Product deleted' });
});

module.exports = { getProducts, getProduct, getFeatured, getCategories, createProduct, updateProduct, deleteProduct };
