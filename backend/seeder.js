// backend/seeder.js
// Run: node seeder.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const seed = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected:', process.env.MONGODB_URI);

    const User    = require('./models/User');
    const Product = require('./models/Product');

    // 2. Clear old data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Old users and products cleared');

    // 3. Manually hash passwords BEFORE creating
    //    This bypasses pre-save hook to avoid double-hashing issues
    const adminHash = await bcrypt.hash('admin123', 12);
    const userHash  = await bcrypt.hash('user123',  12);

    // 4. Insert directly into collection (skips pre-save hook entirely)
    await User.collection.insertMany([
      {
        name:      'Admin User',
        email:     'admin@shopwave.com',
        password:  adminHash,
        role:      'admin',
        phone:     '',
        avatar:    '',
        address:   { street:'', city:'', state:'', zipCode:'', country:'' },
        wishlist:  [],
        isActive:  true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name:      'Test User',
        email:     'user@shopwave.com',
        password:  userHash,
        role:      'user',
        phone:     '',
        avatar:    '',
        address:   { street:'', city:'', state:'', zipCode:'', country:'' },
        wishlist:  [],
        isActive:  true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log('👤 Admin created  → admin@shopwave.com / admin123');
    console.log('👤 User created   → user@shopwave.com  / user123');

    // 5. Verify passwords actually work
    const admin = await User.findOne({ email: 'admin@shopwave.com' }).select('+password');
    const adminOk = await bcrypt.compare('admin123', admin.password);
    console.log('🔑 Admin password check:', adminOk ? '✅ PASS' : '❌ FAIL');

    const user = await User.findOne({ email: 'user@shopwave.com' }).select('+password');
    const userOk = await bcrypt.compare('user123', user.password);
    console.log('🔑 User password check: ', userOk ? '✅ PASS' : '❌ FAIL');

    if (!adminOk || !userOk) {
      console.log('\n❌ Password verification failed! Something is wrong.');
      process.exit(1);
    }

    // 6. Insert products
    const products = [
      {
        name:'iPhone 15 Pro',
        description:'Latest Apple iPhone with A17 Pro chip, titanium design, and 48MP camera with USB-C.',
        price:119900, originalPrice:134900, category:'Electronics', stock:25, brand:'Apple', isFeatured:true, isActive:true, ratings:{ average:4.8, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80', alt:'iPhone 15 Pro' }],
      },
      {
        name:'Samsung Galaxy S24 Ultra',
        description:'Samsung flagship with S Pen, 200MP camera, Snapdragon 8 Gen 3, and titanium frame.',
        price:134999, originalPrice:149999, category:'Electronics', stock:18, brand:'Samsung', isFeatured:true, isActive:true, ratings:{ average:4.7, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=600&q=80', alt:'Samsung Galaxy S24' }],
      },
      {
        name:'Sony WH-1000XM5 Headphones',
        description:'Industry-leading noise cancelling headphones, 30-hour battery, multipoint connection.',
        price:24990, originalPrice:29990, category:'Electronics', stock:40, brand:'Sony', isFeatured:true, isActive:true, ratings:{ average:4.9, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80', alt:'Sony Headphones' }],
      },
      {
        name:'Apple MacBook Air M3',
        description:'Supercharged by M3 chip, 18-hour battery, Liquid Retina display, 1.24 kg.',
        price:114900, originalPrice:124900, category:'Electronics', stock:15, brand:'Apple', isFeatured:true, isActive:true, ratings:{ average:4.9, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80', alt:'MacBook Air' }],
      },
      {
        name:'Canon EOS R50 Camera',
        description:'24.2MP mirrorless camera, 4K video, Dual Pixel CMOS AF, perfect for content creators.',
        price:69990, originalPrice:79990, category:'Electronics', stock:12, brand:'Canon', isFeatured:false, isActive:true, ratings:{ average:4.6, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80', alt:'Canon Camera' }],
      },
      {
        name:'Nike Air Max 270',
        description:'Largest heel Air unit for lightweight cushioning. Breathable mesh upper for everyday comfort.',
        price:8995, originalPrice:11995, category:'Clothing', stock:60, brand:'Nike', isFeatured:true, isActive:true, ratings:{ average:4.5, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', alt:'Nike Air Max 270' }],
      },
      {
        name:"Levi's 511 Slim Fit Jeans",
        description:'Classic slim fit stretch denim jeans. Sits below waist, slim leg from hip to ankle.',
        price:2999, originalPrice:3999, category:'Clothing', stock:80, brand:"Levi's", isFeatured:false, isActive:true, ratings:{ average:4.4, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80', alt:"Levi's Jeans" }],
      },
      {
        name:'Adidas Ultraboost 23',
        description:'BOOST midsole for incredible energy return. Primeknit upper for a sock-like fit.',
        price:11999, originalPrice:15999, category:'Clothing', stock:45, brand:'Adidas', isFeatured:true, isActive:true, ratings:{ average:4.7, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1608379743498-63c2af6e5a35?w=600&q=80', alt:'Adidas Ultraboost' }],
      },
      {
        name:'Atomic Habits — James Clear',
        description:'Practical strategies to build good habits and break bad ones. #1 bestseller.',
        price:399, originalPrice:499, category:'Books', stock:200, brand:'Penguin', isFeatured:true, isActive:true, ratings:{ average:4.9, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80', alt:'Atomic Habits' }],
      },
      {
        name:"Rich Dad Poor Dad",
        description:"Robert Kiyosaki's #1 personal finance book. Financial literacy for everyone.",
        price:299, originalPrice:399, category:'Books', stock:150, brand:'Plata Publishing', isFeatured:false, isActive:true, ratings:{ average:4.7, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&q=80', alt:'Rich Dad Poor Dad' }],
      },
      {
        name:'Instant Pot Duo 7-in-1',
        description:'Pressure cook, slow cook, rice cook, sauté, steam, warm, yoghurt. Saves 70% cooking time.',
        price:7999, originalPrice:9999, category:'Home & Garden', stock:35, brand:'Instant Pot', isFeatured:true, isActive:true, ratings:{ average:4.8, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80', alt:'Instant Pot' }],
      },
      {
        name:'Scented Soy Candle Set',
        description:'Hand-poured soy candles — lavender, vanilla, sandalwood. 45-hour burn each.',
        price:1499, originalPrice:1999, category:'Home & Garden', stock:90, brand:'AromaHome', isFeatured:false, isActive:true, ratings:{ average:4.5, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&q=80', alt:'Scented Candles' }],
      },
      {
        name:'Premium Yoga Mat 6mm',
        description:'Non-slip eco-friendly TPE yoga mat with alignment lines and carrying strap.',
        price:1299, originalPrice:1799, category:'Sports', stock:70, brand:'FitPro', isFeatured:false, isActive:true, ratings:{ average:4.4, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1601925228993-7e0df3b5f506?w=600&q=80', alt:'Yoga Mat' }],
      },
      {
        name:'Adjustable Dumbbell Set 20kg',
        description:'Quick-adjust dial from 2kg–20kg. Replaces 15 weight sets. Home gym essential.',
        price:8999, originalPrice:12999, category:'Sports', stock:25, brand:'PowerFit', isFeatured:true, isActive:true, ratings:{ average:4.6, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80', alt:'Dumbbells' }],
      },
      {
        name:'Vitamin C Face Serum 30ml',
        description:'20% Vitamin C + hyaluronic acid + niacinamide. Brightens, reduces dark spots.',
        price:799, originalPrice:1199, category:'Beauty', stock:100, brand:'GlowLab', isFeatured:true, isActive:true, ratings:{ average:4.6, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80', alt:'Vitamin C Serum' }],
      },
      {
        name:'Dyson Airwrap Styler Complete',
        description:'Style and dry without extreme heat. Coanda effect wraps hair for salon results at home.',
        price:44900, originalPrice:49900, category:'Beauty', stock:10, brand:'Dyson', isFeatured:true, isActive:true, ratings:{ average:4.8, count:0 },
        images:[{ url:'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80', alt:'Dyson Airwrap' }],
      },
    ];

    await Product.insertMany(products);
    console.log(`📦 ${products.length} products inserted`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅  Seeding complete! Everything verified.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ADMIN  →  admin@shopwave.com  /  admin123');
    console.log('  USER   →  user@shopwave.com   /  user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n  Now run:  npm run dev\n');

    process.exit(0);

  } catch (err) {
    console.error('\n❌ Seeder failed:', err.message);
    console.error(err);
    process.exit(1);
  }
};

seed();