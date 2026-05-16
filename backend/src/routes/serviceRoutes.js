const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const User = require('../models/User');
const Request = require('../models/Request');

// @route   GET /api/services/workers?craft=كهرباء
router.get('/workers', async (req, res) => {
  const { craft } = req.query;
  try {
    // Find workers by craft and populate user details (name, email)
    const workers = await Worker.find({ craft })
      .populate('userId', 'name email');
    
    // Format the response to be cleaner for Flutter
    const formattedWorkers = workers
      .filter(w => w.userId) // Ensure user exists
      .map(w => ({
        id: w._id,
        name: w.userId.name,
        rating: w.rating,
        price: w.pricePerHour,
        experience: w.experienceYears
      }));

    res.json(formattedWorkers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/services/request
router.post('/request', async (req, res) => {
  const { clientId, workerId, problem, time, lat, lng } = req.body;
  try {
    const newRequest = new Request({
      clientId,
      workerId,
      problemDescription: problem,
      scheduledTime: time,
      location: { lat, lng }
    });
    await newRequest.save();
    res.json({ msg: 'تم إرسال الطلب بنجاح', requestId: newRequest._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/services/worker/:workerId/requests
router.get('/worker/:workerId/requests', async (req, res) => {
  try {
    const requests = await Request.find({ workerId: req.params.workerId })
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/services/worker/:workerId/profile
router.get('/worker/:workerId/profile', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.workerId).populate('userId', 'name email');
    if (!worker) return res.status(404).json({ msg: 'Worker not found' });
    res.json({
      name: worker.userId.name,
      email: worker.userId.email,
      craft: worker.craft,
      price: worker.pricePerHour,
      experience: worker.experienceYears,
      availableTimes: worker.availableTimes,
      rating: worker.rating
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/services/worker/:workerId/availability
router.post('/worker/:workerId/availability', async (req, res) => {
  const { availableTimes } = req.body;
  try {
    await Worker.findByIdAndUpdate(req.params.workerId, { availableTimes });
    res.json({ msg: 'تم تحديث المواعيد بنجاح' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/services/client/:clientId/requests
router.get('/client/:clientId/requests', async (req, res) => {
  try {
    const requests = await Request.find({ clientId: req.params.clientId })
      .populate({
        path: 'workerId',
        populate: { path: 'userId', select: 'name' }
      })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/services/request/:requestId/status
router.put('/request/:requestId/status', async (req, res) => {
  const { status } = req.body;
  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.requestId,
      { status },
      { new: true }
    );
    res.json(updatedRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
