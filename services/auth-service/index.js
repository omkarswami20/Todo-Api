
const express = require('express');
const router = express.Router();
const authRoutes = require('./routes/authRoutes');

// /api/auth ke baad wali URL authRoutes ko dedo
router.use('/auth', authRoutes);

module.exports = router;