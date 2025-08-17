const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'access_token';

function generateAccessToken(user) {
  const payload = {
    userid:        user.userid,
    username:      user.username ?? null,
    nickname:      user.nickname ?? null,
    email:         user.email ?? null,
    profimg:       user.profimg ?? null,
    oauthprovider: user.oauthprovider,
    oauthid:       user.oauthid,
    role:          user.role ?? 2,
    status:        user.status ?? 1,
  };
  return jwt.sign(payload, SECRET, { expiresIn: '60d', subject: String(user.userid) });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

module.exports = { generateAccessToken, verifyAccessToken };
