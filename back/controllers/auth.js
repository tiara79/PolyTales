// File: back/controllers/auth.js
// 사용자 등록 및 로그인 관련 로직을 처리하는 컨트롤러입니다.

// back/controllers/auth.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database/initDatabase'); // SQLite 연결

//  JWT 토큰 발급 함수
const generateAccessToken = (user) => {
  console.log("🔑 JWT_SECRET 값:", process.env.JWT_SECRET);
  return jwt.sign(
    {
      id: user.id,
      userName: user.userName,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// 회원가입
const register = async (req, res) => {
  const { userName, email, password } = req.body;
  console.log("📨 회원가입 요청:", userName, email, password);

  try {
    const existingUser = db.prepare(
      'SELECT * FROM users WHERE userName = ? OR email = ?'
    ).get(userName, email);

    console.log("🔍 기존 사용자:", existingUser); // 선언 이후에 사용해야 함

    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 사용자 이름 또는 이메일입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insert = db.prepare(
      'INSERT INTO users (userName, email, password) VALUES (?, ?, ?)'
    );
    const result = insert.run(userName, email, hashedPassword);

    const user = {
      id: result.lastInsertRowId,
      userName,
      email,
    };

    const accessToken = generateAccessToken(user);

    res.status(201).json({
      message: '회원가입 및 로그인 성공',
      accessToken,
      user,
    });
  } catch (err) {
    console.error(' 회원가입 에러:', err.message);
    res.status(500).json({ message: '서버 내부 오류' });
  }
};

//  로그인
const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("🔐 로그인 요청:", email);

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      console.log(" 이메일 없음");
      return res.status(400).json({ message: '잘못된 이메일 또는 비밀번호입니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(" 비밀번호 불일치");
      return res.status(400).json({ message: '잘못된 이메일 또는 비밀번호입니다.' });
    }

    const accessToken = generateAccessToken(user);
    console.log(" 로그인 성공");

    res.status(200).json({
      message: '로그인 성공',
      accessToken,
      user: {
        userName: user.userName,
        email: user.email,
      }
    });
  } catch (err) {
    console.error('🚨 로그인 에러:', err);
    res.status(500).json({ message: '서버 오류' });
  }
};

module.exports = {
  register,
  login,
};
