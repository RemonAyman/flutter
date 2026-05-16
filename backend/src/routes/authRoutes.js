const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Worker = require('../models/Worker');

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role, craft, pricePerHour, experienceYears } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password, role, lastLogin: new Date() });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // إذا كان المسجل صنايعي، ننشئ له سجل في جدول الصنايعية
    if (role === 'worker') {
      const newWorker = new Worker({
        userId: user._id,
        craft: craft || 'كهرباء',
        pricePerHour: pricePerHour || 100,
        experienceYears: experienceYears || 0
      });
      await newWorker.save();
    }

    // Return JWT
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, async (err, token) => {
      if (err) throw err;
      
      let workerId = null;
      if (role === 'worker') {
        const worker = await Worker.findOne({ userId: user.id });
        workerId = worker ? worker._id : null;
      }

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          workerId: workerId
        } 
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, async (err, token) => {
      if (err) throw err;

      let workerData = null;
      if (user.role === 'worker') {
        workerData = await Worker.findOne({ userId: user.id });
      }

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          worker: workerData
        } 
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const { userId } = req.body;
  try {
    if (userId) {
      await User.findByIdAndUpdate(userId, { lastLogout: new Date() });
    }
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
