// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('[WARN] MONGO_URI is not set. Starting without DB.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10s sonra vaz keç
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('⚠️ MongoDB connect failed:', err.message);
    // DİQQƏT: PROSESSİ ÖLDÜRMƏ!
    // App DB-siz də ayaqda qalsın ki, 502 yox, 401/500 verə bilsin.
  }
};

module.exports = connectDB;
