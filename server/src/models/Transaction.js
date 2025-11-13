const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    kind: { type: String, enum: ['submit', 'openai', 'courier'], required: true },
    status: { type: String, enum: ['queued', 'processing', 'succeeded', 'failed'], default: 'queued' },
    details: { type: Object, default: {} }
  },
  { timestamps: true }
);

// Indexes for common query patterns
transactionSchema.index({ user: 1, createdAt: -1 }); // User transaction history
transactionSchema.index({ status: 1, createdAt: -1 }); // Filter by status
transactionSchema.index({ kind: 1, status: 1 }); // Filter by kind and status
transactionSchema.index({ createdAt: -1 }); // Sort by date

module.exports = mongoose.model('Transaction', transactionSchema);