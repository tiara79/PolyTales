// 사용자 등록 및 로그인 관련 로직을 처리하는 컨트롤러입니다.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const { db } = require('../database/initDatabase'); // SQLite 연결
const { User } = require('../models'); // 이 줄이 빠져있음

//  JWT 토큰 발급 함수
const generateAccessToken = (user) => {
  console.log("🔑 JWT_SECRET 값:", process.env.JWT_SECRET);
  return jwt.sign(
    {
      userId: user.userId,        // id → userId로 변경
      nickName: user.nickName,    // userName → nickName으로 변경
      email: user.email,
      oauthProvider: user.oauthProvider,  // OAuth 제공자 정보 추가
      oauthId: user.oauthId       // OAuth ID 추가
    },
    process.env.JWT_SECRET,
    { expiresIn: '60d' }
  );
};

// Google OAuth 로그인/회원가입
const googleAuth = async (req, res) => {
  const { oauthProvider, oauthId, email, nickName, profImg } = req.body;
  console.log("🔍 Google 로그인 요청:", { oauthProvider, oauthId, email, nickName });

  try {
    // 기존 사용자 확인 (oauthProvider와 oauthId로)
    let user = await User.findOne({
      where: {
        oauthProvider: oauthProvider,
        oauthId: oauthId
      }
    });

    if (user) {
      // 기존 사용자 - 로그인 처리
      console.log("✅ 기존 사용자 로그인");
      const accessToken = generateAccessToken(user);

      return res.status(200).json({
        message: '로그인 성공',
        token: accessToken,
        user: {
          userId: user.userId,
          nickName: user.nickName,
          email: user.email,
          profImg: user.profImg,
          oauthProvider: user.oauthProvider
        }
      });
    } else {
      // 새 사용자 - 회원가입 처리
      console.log("📝 새 사용자 회원가입");
      const newUser = await User.create({
        oauthProvider: oauthProvider,
        oauthId: oauthId,
        email: email,
        nickName: nickName,
        profImg: profImg
      });

      const accessToken = generateAccessToken(newUser);

      return res.status(201).json({
        message: '회원가입 및 로그인 성공',
        token: accessToken,
        user: {
          userId: newUser.userId,
          nickName: newUser.nickName,
          email: newUser.email,
          profImg: newUser.profImg,
          oauthProvider: newUser.oauthProvider
        }
      });
    }
  } catch (err) {
    console.error('🚨 Google 로그인 에러:', err);
    res.status(500).json({
      message: '서버 내부 오류',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


module.exports = {
  googleAuth,

};
