const asyncHandler = require('express-async-handler');
const bcrypt       = require('bcryptjs');
const User         = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @route  POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400); throw new Error('Name, email and password are required');
  }
  if (password.length < 6) {
    res.status(400); throw new Error('Password must be at least 6 characters');
  }
  if (await User.findOne({ email: email.toLowerCase() })) {
    res.status(400); throw new Error('An account with this email already exists');
  }

  // Hash password manually — reliable across all environments
  const hashed = await bcrypt.hash(password, 12);

  // Insert directly — bypasses any pre-save hook double-hash risk
  const result = await User.collection.insertOne({
    name,
    email:     email.toLowerCase(),
    password:  hashed,
    role:      role === 'admin' && process.env.NODE_ENV === 'development' ? 'admin' : 'user',
    phone:     '',
    avatar:    '',
    address:   { street:'', city:'', state:'', zipCode:'', country:'' },
    wishlist:  [],
    isActive:  true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const user = await User.findById(result.insertedId);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    },
  });
});

// @route  POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400); throw new Error('Email and password are required');
  }

  // Find user — must select password since it's select:false in schema
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    res.status(401); throw new Error('No account found with this email');
  }

  if (!user.isActive) {
    res.status(401); throw new Error('This account has been deactivated');
  }

  // Compare password using bcrypt directly
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401); throw new Error('Incorrect password');
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      avatar: user.avatar || '',
      phone:  user.phone  || '',
      token:  generateToken(user._id),
    },
  });
});

// @route  GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price images');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, data: user });
});

// @route  PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  // Don't allow password update through this route
  const { password, role, ...allowed } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { ...allowed, updatedAt: new Date() },
    { new: true, runValidators: false }
  );
  res.json({ success: true, message: 'Profile updated', data: user });
});

// @route  PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400); throw new Error('Both fields required');
  }
  if (newPassword.length < 6) {
    res.status(400); throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) { res.status(400); throw new Error('Current password is incorrect'); }

  const hashed = await bcrypt.hash(newPassword, 12);
  await User.findByIdAndUpdate(req.user._id, { password: hashed });

  res.json({ success: true, message: 'Password changed successfully', data: { token: generateToken(user._id) } });
});

module.exports = { register, login, getMe, updateProfile, changePassword };