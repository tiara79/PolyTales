// src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

// 기본 인증 미들웨어
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const user = await User.findByPk(decoded.userid);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// 인증 필수 (authRequired 별칭)
const authRequired = authenticate;

// 관리자 전용
const onlyAdmin = (req, res, next) => {
  if (req.user?.role === 1) {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

module.exports = { authenticate, authRequired, onlyAdmin };
