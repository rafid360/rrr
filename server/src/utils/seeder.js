const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Package = require('../models/Package');

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@fastedge.local';
  const password = process.env.ADMIN_PASSWORD || 'admin12345';
  const name = process.env.ADMIN_NAME || 'Administrator';
  if (mongoose.connection.readyState !== 1) {
    console.warn('[Seed] Database not connected; skipping admin seeding');
    return;
  }
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('[Seed] Admin user already exists');
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ name, email, passwordHash, role: 'admin' });
  console.log('[Seed] Admin user created:', email);
}
async function seedPackages() {
  if (mongoose.connection.readyState !== 1) {
    console.warn('[Seed] Database not connected; skipping package seeding');
    return;
  }
  const count = await Package.countDocuments();
  if (count > 0) {
    console.log('[Seed] Packages already exist');
    return;
  }
  const pkgs = [
    { name: 'Basic', dailyLimit: 100, priceMonthly: 19 },
    { name: 'Standard', dailyLimit: 200, priceMonthly: 29 },
    { name: 'Pro', dailyLimit: 500, priceMonthly: 59 },
    { name: 'Enterprise', dailyLimit: 1000, priceMonthly: 99 }
  ];
  await Package.insertMany(pkgs);
  console.log('[Seed] Default packages created');
}

async function seedDemoUsers() {
  if (mongoose.connection.readyState !== 1) {
    console.warn('[Seed] Database not connected; skipping demo users seeding');
    return;
  }
  const pkgs = await Package.find({ name: { $in: ['Basic', 'Standard', 'Pro'] } });
  const pkgByName = Object.fromEntries(pkgs.map((p) => [p.name, p]));
  const users = [
    { name: 'Demo User 1', email: 'demo1@fastedge.local', password: 'demo12345', packageName: 'Basic' },
    { name: 'Demo User 2', email: 'demo2@fastedge.local', password: 'demo23456', packageName: 'Standard' },
    { name: 'Demo User 3', email: 'demo3@fastedge.local', password: 'demo34567', packageName: 'Pro' }
  ];
  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log('[Seed] Demo user exists:', u.email);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 12);
    const pkg = pkgByName[u.packageName];
    await User.create({ name: u.name, email: u.email, passwordHash, role: 'user', package: pkg ? pkg._id : null });
    console.log('[Seed] Demo user created:', u.email);
  }
}

module.exports = { seedAdmin, seedPackages, seedDemoUsers };