// 사용자 등록 및 로그인 관련 로직을 처리하는 컨트롤러입니다.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); 

//  JWT 토큰 발급 함수
const generateAccessToken = (user) => {
  console.log("🔑 JWT_SECRET 값:", process.env.JWT_SECRET);
  return jwt.sign(
    {
      userid: user.userid,
      nickname: user.nickname,
      email: user.email,
      oauthprovider: user.oauthprovider,
      oauthid: user.oauthid
    },
    process.env.JWT_SECRET,
    { expiresIn: '60d' }
  );
};

// Google OAuth 로그인/회원가입 
const googleAuth = async (req, res) => {
  try {
    console.log("🔍 Google 로그인 요청:", JSON.stringify(req.body, null, 2));
    
    const { oauthprovider, oauthid, email, nickname, profimg } = req.body;

    // 엄격한 검증
    if (!oauthprovider || !oauthid || !email) {
      return res.status(400).json({
        message: "필수 정보가 누락되었습니다.",
        required: ["oauthprovider", "oauthid", "email"],
        received: { oauthprovider, oauthid, email, nickname }
      });
    }

    console.log("🔍 검증된 데이터:", { oauthprovider, oauthid, email, nickname, profimg });

    // 1차: OAuth ID로 정확한 사용자 확인
    let user = await User.findOne({
      where: {
        oauthprovider: oauthprovider,
        oauthid: oauthid
      }
    });

    if (user) {
      console.log("✅ OAuth ID로 기존 사용자 찾음:", user.email);
      const accessToken = generateAccessToken(user);
      
      return res.status(200).json({
        message: "기존 사용자 로그인 성공",
        user: {
          userid: user.userid,
          nickname: user.nickname,
          email: user.email,
          profimg: user.profimg
        },
        token: accessToken
      });
    }

    // 2차: 같은 이메일 + Google 계정 중복 확인 및 처리
    const existingGoogleUser = await User.findOne({
      where: {
        email: email,
        oauthprovider: 'google'
      }
    });

    if (existingGoogleUser) {
      console.log("⚠️ 같은 이메일로 이미 Google 가입된 계정 존재:", existingGoogleUser.email);
      console.log("🔄 기존 계정의 OAuth ID 업데이트 진행");
      
      // 기존 사용자 정보 업데이트 (OAuth ID 변경)
      await existingGoogleUser.update({
        oauthid: oauthid,
        nickname: nickname || existingGoogleUser.nickname,
        profimg: profimg || existingGoogleUser.profimg
      });

      const accessToken = generateAccessToken(existingGoogleUser);
      
      return res.status(200).json({
        message: "기존 Google 계정 정보 업데이트 후 로그인 성공",
        user: {
          userid: existingGoogleUser.userid,
          nickname: existingGoogleUser.nickname,
          email: existingGoogleUser.email,
          profimg: existingGoogleUser.profimg
        },
        token: accessToken
      });
    }

    // 3차: 다른 OAuth 제공자로 가입된 같은 이메일 확인
    const existingUserWithSameEmail = await User.findOne({
      where: {
        email: email
      }
    });

    if (existingUserWithSameEmail) {
      console.log("❌ 같은 이메일이 다른 OAuth 제공자로 이미 가입됨:", existingUserWithSameEmail.email);
      
      return res.status(409).json({
        message: "이미 가입된 이메일입니다.",
        error: `이 이메일은 이미 ${existingUserWithSameEmail.oauthprovider} 계정으로 가입되어 있습니다.`,
        existingProvider: existingUserWithSameEmail.oauthprovider
      });
    }

    // 4차: 완전 신규 사용자 생성
    console.log("📝 완전 신규 Google 사용자 생성");
    
    const newUser = await User.create({
      oauthprovider: oauthprovider,
      oauthid: oauthid,
      email: email,
      nickname: nickname || `구글사용자${Date.now()}`,
      profimg: profimg || null,
      status: 1,
      role: 2,
      plan: 1
    });

    console.log("✅ 신규 사용자 생성 완료:", newUser.email);
    const accessToken = generateAccessToken(newUser);

    return res.status(201).json({
      message: "신규 사용자 회원가입 및 로그인 성공",
      user: {
        userid: newUser.userid,
        nickname: newUser.nickname,
        email: newUser.email,
        profimg: newUser.profimg
      },
      token: accessToken
    });

  } catch (error) {
    console.error("🚨 Google 로그인 에러:", error);
    res.status(500).json({
      message: "서버 내부 오류",
      error: process.env.NODE_ENV === 'development' ? error.message : "로그인 처리 중 오류가 발생했습니다."
    });
  }
};

module.exports = {
  googleAuth,
};