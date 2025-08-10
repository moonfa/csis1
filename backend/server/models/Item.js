// models/items.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String, trim: true }, // URL or base64
    isClosed: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Item', itemSchema);
