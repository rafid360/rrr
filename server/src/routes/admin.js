const express = require('express');
const mongoose = require('mongoose');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const User = require('../models/User');
const Package = require('../models/Package');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Ensure DB connected for all admin endpoints
router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database not connected' });
  }
  next();
});

// Users list with search and status filters
router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { search = '', status, page = 1, limit = 50 } = req.query;
    const q = {};
    if (search) {
      q.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    if (status === 'suspended') q.suspended = true;
    if (status === 'active') q.suspended = false;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(q)
        .select('name email role suspended package')
        .populate('package')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(), // Convert to plain JS objects for better performance
      User.countDocuments(q)
    ]);
    
    return res.json({ 
      users, 
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('[Admin] users list error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create user (admin manual)
router.post('/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, packageId } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing required fields' });
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: 'Email already in use' });
    const passwordHash = await require('bcryptjs').hash(password, 12);
    const payload = { name, email: normalizedEmail, passwordHash, role: 'user' };
    if (packageId) {
      const pkg = await Package.findById(packageId);
      if (!pkg) return res.status(404).json({ message: 'Package not found' });
      payload.package = pkg._id;
    }
    const user = await User.create(payload);
    return res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error('[Admin] create user error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Suspend/Unsuspend
router.patch('/users/:id/suspend', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { suspended } = req.body;
    if (typeof suspended !== 'boolean') return res.status(400).json({ message: 'suspended must be boolean' });
    const user = await User.findByIdAndUpdate(req.params.id, { suspended }, { new: true }).select('name email role suspended');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error('[Admin] suspend error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Assign package to user
router.patch('/users/:id/package', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { packageId } = req.body;
    if (!packageId) return res.status(400).json({ message: 'packageId required' });
    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    const user = await User.findByIdAndUpdate(req.params.id, { package: packageId }, { new: true }).select('name email role suspended package').populate('package');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error('[Admin] assign package error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Packages list
router.get('/packages', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const pkgs = await Package.find({}).sort({ priceMonthly: 1 }).lean();
    return res.json(pkgs);
  } catch (err) {
    console.error('[Admin] packages list error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create or update package
router.post('/packages', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { name, dailyLimit, priceMonthly, active = true } = req.body;
    if (!name || !dailyLimit || !priceMonthly) return res.status(400).json({ message: 'Missing fields' });
    const pkg = await Package.create({ name, dailyLimit, priceMonthly, active });
    return res.status(201).json(pkg);
  } catch (err) {
    console.error('[Admin] create package error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/packages/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const update = {};
    ['name', 'dailyLimit', 'priceMonthly', 'active'].forEach((k) => {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    });
    const pkg = await Package.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    return res.json(pkg);
  } catch (err) {
    console.error('[Admin] update package error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Payments list
router.get('/payments', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [payments, total] = await Promise.all([
      Payment.find({})
        .sort({ createdAt: -1 })
        .populate('user', 'name email')
        .populate('package', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Payment.countDocuments({})
    ]);
    
    return res.json({ 
      payments, 
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('[Admin] payments list error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create payment (admin manual)
router.post('/payments', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { userId, packageId, amount, currency = 'USD', provider = 'manual', status = 'pending', reference = '' } = req.body;
    if (!userId || !amount) return res.status(400).json({ message: 'Missing required fields' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const paymentDoc = {
      user: user._id,
      amount,
      currency,
      provider,
      status,
      reference
    };
    if (packageId) {
      const pkg = await Package.findById(packageId);
      if (!pkg) return res.status(404).json({ message: 'Package not found' });
      paymentDoc.package = pkg._id;
    }
    const payment = await Payment.create(paymentDoc);
    return res.status(201).json(payment);
  } catch (err) {
    console.error('[Admin] create payment error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Transactions list
router.get('/transactions', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [txs, total] = await Promise.all([
      Transaction.find({})
        .sort({ createdAt: -1 })
        .populate('user', 'name email')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Transaction.countDocuments({})
    ]);
    
    return res.json({ 
      transactions: txs, 
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('[Admin] transactions list error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create transaction (admin manual)
router.post('/transactions', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { userId, kind, status = 'queued', details = {} } = req.body;
    if (!userId || !kind) return res.status(400).json({ message: 'Missing required fields' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const tx = await Transaction.create({ user: user._id, kind, status, details });
    return res.status(201).json(tx);
  } catch (err) {
    console.error('[Admin] create transaction error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;