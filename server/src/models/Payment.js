const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: false },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    provider: { type: String, enum: ['stripe', 'manual', 'other'], default: 'manual' },
    status: { type: String, enum: ['succeeded', 'failed', 'pending'], default: 'pending' },
    reference: { type: String, default: '' }
  },
  { timestamps: true }
);

// Indexes for common query patterns
paymentSchema.index({ user: 1, createdAt: -1 }); // User payments history
paymentSchema.index({ status: 1, createdAt: -1 }); // Filter by status
paymentSchema.index({ createdAt: -1 }); // Sort by date

module.exports = mongoose.model('Payment', paymentSchema);