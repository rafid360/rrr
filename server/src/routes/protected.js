const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.get('/admin', requireAuth, requireRole('admin'), (req, res) => {
  return res.json({ message: 'Admin access granted' });
});

router.get('/user', requireAuth, (req, res) => {
  if (req.user.role !== 'user' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return res.json({ message: 'User access granted' });
});

module.exports = router;