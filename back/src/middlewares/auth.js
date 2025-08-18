// back/src/middleware/auth.js
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "dev_secret";

const authRequired = (req, res, next) => {
  const auth = req.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "unauthorized" });

  try {
    const p = jwt.verify(token, SECRET);
    req.user = {
      userid: p.userid,
      role: p.role ?? 2, // 1: admin
      email: p.email,
    };
    next();
  } catch {
    return res.status(401).json({ message: "invalid token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === 1) return next();
  return res.status(403).json({ message: "forbidden" });
};

// 호환성을 위한 alias들
const required = authRequired;
const onlyAdmin = adminOnly;

module.exports = {
  authRequired,
  required,
  adminOnly,
  onlyAdmin
};
