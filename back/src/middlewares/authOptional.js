const jwt = require("jsonwebtoken");

//선택 인증 미들웨어 (토큰 없어도 통과)
module.exports = function authOptional(req, _res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return next();
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_) {
    // 토큰 에러는 무시하고 비로그인으로 처리
  }
  next();
};
