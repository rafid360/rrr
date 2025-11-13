const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    dailyLimit: { type: Number, required: true },
    priceMonthly: { type: Number, required: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Package', packageSchema);