const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Sal7ny API is running...');
});

// Auth Routes
app.use('/api/auth', require('./src/routes/authRoutes'));

// Service Routes
app.use('/api/services', require('./src/routes/serviceRoutes'));

// Admin Routes
app.use('/api/admin', require('./src/routes/adminRoutes'));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sal7ny')
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log(err));
