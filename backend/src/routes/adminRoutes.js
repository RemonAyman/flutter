const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Worker = require('../models/Worker');
const Request = require('../models/Request');

// @route   GET /api/admin/stats
// @desc    Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }).select('-password').sort({ createdAt: -1 });
    const workersData = await Worker.find().populate('userId', '-password');
    
    // جلب آخر 10 عمليات (طلبات)
    const recentRequests = await Request.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('clientId', 'name')
      .populate({
        path: 'workerId',
        populate: { path: 'userId', select: 'name' }
      });
      
    // Format workers data for easier UI handling
    const workers = workersData.map(w => ({
      id: w._id,
      name: w.userId?.name || 'غير معروف',
      email: w.userId?.email || '',
      craft: w.craft,
      experience: w.experienceYears,
      price: w.pricePerHour,
      lastLogin: w.userId?.lastLogin,
      lastLogout: w.userId?.lastLogout,
      rating: w.rating
    }));

    res.json({
      totalUsers: clients.length,
      totalWorkers: workers.length,
      clients,
      workers,
      recentRequests
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
