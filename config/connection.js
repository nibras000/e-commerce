// config/connection.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shoppikko';
    await mongoose.connect(uri); // add options if you need them
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // crash fast if DB can’t connect in production
  }
};

module.exports = connectDB;
