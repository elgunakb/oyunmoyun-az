// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const Player = require('../models/Player');

const sessionProtect = async (req, res, next) => {
  try {
    let token = null;

    // 1) Authorization: Bearer <token> varsa götür
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      token = auth.split(' ')[1];
    }

    // 2) Yoxdursa cookie-dən götür
    if (!token && req.cookies && req.cookies.session) {
      token = req.cookies.session;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'session') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    const player = await Player.findOne({ playerId: decoded.pid });
    if (!player) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.player = player; // DB sənədi
    req.session = decoded; // JWT payload (exp, pid, provider)
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Token failed', error: error.message });
  }
};

module.exports = { sessionProtect };
