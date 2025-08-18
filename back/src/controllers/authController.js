const bcrypt = require('bcryptjs'); // 비밀번호를 일방향 해시로 저장/검증하는 라이브러리.
const crypto = require('crypto'); // 각종 암호학 유틸로 고유 ID 생성, 안전한 랜덤/암호 기능
const { Op } = require('sequelize');
const { User } = require('../models');
const { generateAccessToken } = require('../utils/token');
const toSafe = require('../utils/toSafe');
const axios = require('axios');

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
      // 저장 직후 profimg 등 모든 필드가 반영된 user를 다시 조회
      user = await User.findOne({ where: { oauthprovider, oauthid } });
    } else {
      // 기존 유저: 구글 프로필 이미지가 바뀌었으면 업데이트
      if (profimg && user.profimg !== profimg) {
        user.profimg = profimg;
        await user.save();
      }
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

// 네이버 OAuth 콜백(GET)
async function naverCallback(req, res) {
  try {
    const { code, state } = req.query;
    if (!code || !state) return res.status(400).send('Missing code or state');

    // 1. 네이버 토큰 요청
    const tokenRes = await axios.get('https://nid.naver.com/oauth2.0/token', {
      params: {
        grant_type: 'authorization_code',
        client_id: process.env.NAVER_CLIENT_ID,
        client_secret: process.env.NAVER_CLIENT_SECRET,
        code,
        state,
      },
    });
    const access_token = tokenRes.data.access_token;
    if (!access_token) return res.status(400).send('No access_token from Naver');

    // 2. 네이버 사용자 정보 요청
    const profileRes = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const naverUser = profileRes.data.response;
    if (!naverUser) return res.status(400).send('No user info from Naver');

    // 3. DB 저장/갱신
    let user = await User.findOne({ where: { oauthprovider: 'naver', oauthid: naverUser.id } });
    if (!user) {
      user = await User.create({
        oauthprovider: 'naver',
        oauthid: naverUser.id,
        email: naverUser.email ?? null,
        nickname: naverUser.nickname || naverUser.name || naverUser.email?.split('@')[0] || null,
        profimg: naverUser.profile_image ?? null,
        status: 1,
        role: 2,
        plan: 1,
      });
      user = await User.findOne({ where: { oauthprovider: 'naver', oauthid: naverUser.id } });
    } else {
      let changed = false;
      if (naverUser.profile_image && user.profimg !== naverUser.profile_image) {
        user.profimg = naverUser.profile_image;
        changed = true;
      }
      if (naverUser.nickname && user.nickname !== naverUser.nickname) {
        user.nickname = naverUser.nickname;
        changed = true;
      }
      if (changed) await user.save();
    }

    // 4. JWT 발급 및 프론트엔드로 리디렉션 (토큰 쿼리로 전달, access_token도 함께)
    const token = generateAccessToken(user);
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3001'}/login?naver=success&token=${token}&access_token=${access_token}`);
  } catch (e) {
    console.error(e);
    return res.status(500).send('Naver login error');
  }
}


// Naver OAuth
async function naverAuth(req, res) {
  try {
    const { code, state } = req.body;
    if (!code || !state) return res.status(400).json({ message: 'code/state required' });

    // 1. 네이버 토큰 요청
    const tokenRes = await axios.get('https://nid.naver.com/oauth2.0/token', {
      params: {
        grant_type: 'authorization_code',
        client_id: NAVER_CLIENT_ID,
        client_secret: NAVER_CLIENT_SECRET,
        code,
        state,
      },
    });
    const access_token = tokenRes.data.access_token;
    if (!access_token) return res.status(400).json({ message: 'No access_token from Naver' });

    // 2. 네이버 사용자 정보 요청
    const profileRes = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const naverUser = profileRes.data.response;
    if (!naverUser) return res.status(400).json({ message: 'No user info from Naver' });

    // 3. DB 저장/갱신
    let user = await User.findOne({ where: { oauthprovider: 'naver', oauthid: naverUser.id } });
    if (!user) {
      user = await User.create({
        oauthprovider: 'naver',
        oauthid: naverUser.id,
        email: naverUser.email ?? null,
        nickname: naverUser.nickname || naverUser.name || naverUser.email?.split('@')[0] || null,
        profimg: naverUser.profile_image ?? null,
        status: 1,
        role: 2,
        plan: 1,
      });
      user = await User.findOne({ where: { oauthprovider: 'naver', oauthid: naverUser.id } });
    } else {
      // 프로필 이미지/닉네임 변경시 갱신
      let changed = false;
      if (naverUser.profile_image && user.profimg !== naverUser.profile_image) {
        user.profimg = naverUser.profile_image;
        changed = true;
      }
      if (naverUser.nickname && user.nickname !== naverUser.nickname) {
        user.nickname = naverUser.nickname;
        changed = true;
      }
      if (changed) await user.save();
    }

    // 4. JWT 발급 및 반환
    const token = generateAccessToken(user);
    return res.json({ token, user: toSafe(user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Naver login error' });
  }
}

// 네이버 연결 해제(언링크) - 프론트에서 access_token을 받아 백엔드에서 직접 호출
async function naverUnlink(req, res) {
  try {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ message: 'access_token required' });
    const params = new URLSearchParams({
      grant_type: 'delete',
      client_id: process.env.NAVER_CLIENT_ID,
      client_secret: process.env.NAVER_CLIENT_SECRET,
      access_token,
      service_provider: 'NAVER',
    });
    const result = await axios.post(
      'https://nid.naver.com/oauth2.0/token',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return res.json(result.data);
  } catch (e) {
    console.error('[naverUnlink] error:', e?.response?.data || e.message);
    return res.status(500).json({ error: e?.response?.data || e.message });
  }
}

// 카카오 OAuth
async function kakaoAuth(req, res) {
  try {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ message: 'access_token required' });

    // 1. 카카오 사용자 정보 요청
    const profileRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const kakaoUser = profileRes.data;
    if (!kakaoUser || !kakaoUser.id) return res.status(400).json({ message: 'No user info from Kakao' });

    // 2. DB 저장/갱신
    let user = await User.findOne({ where: { oauthprovider: 'kakao', oauthid: String(kakaoUser.id) } });
    const kakaoAccount = kakaoUser.kakao_account || {};
    if (!user) {
      user = await User.create({
        oauthprovider: 'kakao',
        oauthid: String(kakaoUser.id),
        email: kakaoAccount.email ?? null,
        nickname: kakaoAccount.profile?.nickname || kakaoAccount.email?.split('@')[0] || null,
        profimg: kakaoAccount.profile?.profile_image_url ?? null,
        status: 1,
        role: 2,
        plan: 1,
      });
      user = await User.findOne({ where: { oauthprovider: 'kakao', oauthid: String(kakaoUser.id) } });
    } else {
      let changed = false;
      if (kakaoAccount.profile?.profile_image_url && user.profimg !== kakaoAccount.profile.profile_image_url) {
        user.profimg = kakaoAccount.profile.profile_image_url;
        changed = true;
      }
      if (kakaoAccount.profile?.nickname && user.nickname !== kakaoAccount.profile.nickname) {
        user.nickname = kakaoAccount.profile.nickname;
        changed = true;
      }
      if (changed) await user.save();
    }

    // 3. JWT 발급 및 반환
    const token = generateAccessToken(user);
    return res.json({ token, user: toSafe(user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Kakao login error' });
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
    return res.status(201).json({
      token, user: {
        userid: user.userid, username: user.username, nickname: user.nickname,
        email: user.email, profimg: user.profimg, oauthprovider: user.oauthprovider, oauthid: user.oauthid,
        status: user.status, role: user.role, plan: user.plan,
      }
    });
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

module.exports = { googleAuth, naverAuth, naverCallback, kakaoAuth, register, login, me, naverUnlink };
