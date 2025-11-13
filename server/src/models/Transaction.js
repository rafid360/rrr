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

module.exports = mongoose.model('Transaction', transactionSchema);