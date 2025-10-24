const mongoose = require('mongoose');

const addressRegex = /^0x[a-fA-F0-9]{40}$/;

const ProductSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, trim: true, unique: true, index: true },
    manufacturer: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: addressRegex,
      index: true,
    },
    details: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;