const bcrypt = require('bcryptjs'); // 비밀번호를 일방향 해시로 저장/검증하는 라이브러리.
const crypto = require('crypto'); // 각종 암호학 유틸로 고유 ID 생성, 안전한 랜덤/암호 기능
const { Op } = require('sequelize');
const { User } = require('../models');
const { generateAccessToken } = require('../util/token');
const toSafe = require('../util/toSafe');

// Google OAuth (요청 body 키: oauthprovider, oauthid)
async function googleAuth(req, res) {
  try {
    const { oauthprovider, oauthid, email, nickname, profimg } = req.body || {};
    if (!oauthprovider || !oauthid) {
      return res.status(400).json({ message: 'oauthprovider/oauthid required' });
    }

    let user = await User.findOne({ where: { oauthprovider, oauthid } });
    if (!user) {
      // 같은 이메일이 다른 provider로 이미 쓰이는 경우 충돌
      if (email) {
        const sameEmail = await User.findOne({ where: { email } });
        if (sameEmail && sameEmail.oauthprovider !== 'google') {
          return res.status(409).json({ message: `Email already used by ${sameEmail.oauthprovider}` });
        }
      }
      user = await User.create({
        oauthprovider,
        oauthid,
        email: email ?? null,
        nickname: nickname ?? null,
        profimg: profimg ?? null,
        status: 1,
        role: 2,
        plan: 1,
      });
    }

    if ([3, 4].includes(user.status)) {
      return res.status(403).json({ message: 'Account disabled' });
    }

    const token = generateAccessToken(user);
    return res.json({ token, user: toSafe(user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Social login error' });
  }
}

// 로컬 회원가입
async function register(req, res) {
  try {
    const { username, password, email, phone, nickname } = req.body || {};
    if (!username || !password || !email) return res.status(400).json({ message: 'missing fields' });

    const exists = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
    if (exists) return res.status(400).json({ message: 'username/email already used' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hash,
      email,
      phone: phone ?? null,
      nickname: nickname ?? username,
      oauthprovider: 'local',                       // ← 소셜+로컬 동시 사용 필수
      oauthid: `local:${crypto.randomUUID()}`,     // ← NOT NULL + UNIQUE 충족
      status: 1, role: 2, plan: 1,
    });

    const token = generateAccessToken(user);
    return res.status(201).json({ token, user: {
      userid: user.userid, username: user.username, nickname: user.nickname,
      email: user.email, profimg: user.profimg, oauthprovider: user.oauthprovider, oauthid: user.oauthid,
      status: user.status, role: user.role, plan: user.plan,
    }});
  } catch (e) {
    console.error(e);
    return res.status(400).json({ message: 'register error' });
  }
}

// 로컬 로그인
async function login(req, res) {
  try {
    const { username, password } = req.body || {};
    const user = await User.findOne({ where: { username } });
    if (!user || !user.password) return res.status(400).json({ message: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'invalid credentials' });
    if ([3, 4].includes(user.status)) return res.status(403).json({ message: 'Account disabled' });

    const token = generateAccessToken(user);
    return res.json({ token, user: toSafe(user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'login error' });
  }
}

// 내 정보
async function me(req, res) {
  const user = await User.findByPk(req.user.userid);
  if (!user) return res.status(404).json({ message: 'Not found' });
  return res.json({ user: toSafe(user) });
}

module.exports = { googleAuth, register, login, me };
