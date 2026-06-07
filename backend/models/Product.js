const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    description:   { type: String, required: true },
    price:         { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Electronics','Clothing','Books','Home & Garden','Sports','Beauty','Toys','Automotive','Food','Other'],
    },
    images:  [{ url: { type: String, required: true }, alt: { type: String, default: '' } }],
    stock:   { type: Number, required: true, default: 0, min: 0 },
    brand:   { type: String, default: '' },
    ratings: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    isFeatured: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
    sku:        { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
