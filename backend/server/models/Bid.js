const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    
    userId: { type: String, required: true, trim: true },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Bid must be > 0'],
      validate: {
        validator: (v) => Number.isFinite(v),
        message: 'Bid must be a number',
      },
    },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    versionKey: false,
  }
);


bidSchema.index({ itemId: 1, amount: -1, timestamp: 1 });


bidSchema.statics.topForItem = function (itemId) {
  return this.findOne({ itemId }).sort({ amount: -1, timestamp: 1 }).lean();
};

module.exports = mongoose.model('Bid', bidSchema);
