// back/middlewares/auth.js
//JWT 토큰 인증 미들웨어 (요청 보호용)

require("dotenv").config();
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔐 JWT_SECRET used for verify:", process.env.JWT_SECRET);


  // Authorization header가 없거나 Bearer로 시작하지 않으면
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "토큰이 없습니다 (Not authorized)" });
  }

  const token = authHeader.split(" ")[1];

  try {
     // 토큰 검증 및 만료 시간 확인
     //로그인 후 발급된 토큰은 1시간 동안 유효하며, 만약 만료되면 "토큰이 만료되었습니다"라는 메시지가 반환
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // user.id, email 등 payload 접근 가능
      next();
  } catch (err) {
    // 오류 메시지 세분화 처리
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "토큰이 만료되었습니다" });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "유효하지 않은 토큰입니다" });
    }
    // 기타 오류 처리
    return res.status(401).json({ message: "인증 실패" });
  }
};

module.exports = { authenticate };
