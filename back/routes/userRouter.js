// back/routes/userRouter.js
const express = require('express');
const router = express.Router();
const db = require('../database/initDatabase.js');

router.post('/signup', (req, res) => {
  const { email, password, userName } = req.body;

  try {
    db.prepare("INSERT INTO users (email, password, userName) VALUES (?, ?, ?)")
      .run(email, password, userName);

    res.json({ success: true });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      res.status(400).json({ success: false, message: "이메일 중복" });
    } else {
      res.status(500).json({ success: false, message: "서버 오류" });
    }
  }
});

module.exports = router;
