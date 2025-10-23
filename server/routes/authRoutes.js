// routes/authRoutes.js
const express = require('express');
const {
  loginWithGoogleSupabase,
  loginAsGuest,
  getMe,
  logout,
} = require('../controllers/authController');
const { sessionProtect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Yeni axın
router.post('/google', loginWithGoogleSupabase); // body: { access_token }
router.post('/guest', loginAsGuest); // body: { nickname }
router.get('/me', sessionProtect, getMe);
router.post('/logout', logout);

module.exports = router;
