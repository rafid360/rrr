const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    suspended: { type: Boolean, default: false, index: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', default: null },
    dailyRequestCount: { type: Number, default: 0 },
    lastRequestDate: { type: Date, default: null }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
module.exports = User;