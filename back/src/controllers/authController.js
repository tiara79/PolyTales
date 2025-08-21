// authController.js (네이버/카카오 기능 안전 비활성화 포함)
const { User } = require('../models');
const { generateToken } = require('../util/token');
const toSafe = require('../util/toSafe');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client();

const FRONT_URL = process.env.CLIENT_URL || 'http://localhost:3001';

exports.googleCallback = async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ ok: false, message: 'No credentials provided' });

  try {
    const ticket = await client.verifyIdToken({ idToken: credential });
    const payload = ticket.getPayload();
    const email = payload.email;
    const user = await User.findOrCreate({
      where: { email },
      defaults: {
        email,
        provider: 'google',
        username: payload.name,
        profileimage: payload.picture
      }
    });
    const token = generateToken(user[0].id);
    return res.json({ ok: true, token });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(500).json({ ok: false, message: 'Google login failed' });
  }
};

//  네이버 로그인 안전 비활성화
exports.naverCallback = (req, res) => {
  console.log('[비활성화] 네이버 로그인은 현재 사용되지 않습니다.');
  res.redirect(`${FRONT_URL}/auth/naver/fail`);
};

//  카카오 로그인 안전 비활성화
exports.kakaoCallback = (req, res) => {
  console.log('[비활성화] 카카오 로그인은 현재 사용되지 않습니다.');
  res.redirect(`${FRONT_URL}/auth/kakao/fail`);
};

//  이메일 회원가입 테스트용
exports.createLocalUser = async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, username, provider: 'local' });
    const token = generateToken(user.id);
    return res.json({ ok: true, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'User creation failed' });
  }
};

//  토큰 확인용
exports.verify = (req, res) => {
  if (!req.user) return res.status(401).json({ ok: false });
  res.json({ ok: true, user: toSafe(req.user) });
};

//  기본 로그인
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ ok: false, message: 'No such user' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ ok: false, message: 'Wrong password' });
    const token = generateToken(user.id);
    res.json({ ok: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Login failed' });
  }
};
