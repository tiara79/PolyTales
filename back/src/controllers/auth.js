// 사용자 등록 및 로그인 관련 로직을 처리하는 컨트롤러입니다.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); 

//  JWT 토큰 발급 함수
const generateAccessToken = (user) => {
  console.log("🔑 JWT_SECRET VALUE:", process.env.JWT_SECRET);
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
    // console.log("Google Login Request:", JSON.stringify(req.body, null, 2));
    
    const { oauthprovider, oauthid, email, nickname, profimg } = req.body;

    // 엄격한 검증
    if (!oauthprovider || !oauthid || !email) {
      return res.status(400).json({
        message: "Required information is missing",
        required: ["oauthprovider", "oauthid", "email"],
        received: { oauthprovider, oauthid, email, nickname }
      });
    }

    // console.log("Verified data:", { oauthprovider, oauthid, email, nickname, profimg });

    // 1차: OAuth ID로 정확한 사용자 확인
    let user = await User.findOne({
      where: {
        oauthprovider: oauthprovider,
        oauthid: oauthid
      }
    });

    if (user) {
      // console.log("Find existing users with OAuth ID:", user.email);
      const accessToken = generateAccessToken(user);
      
      return res.status(200).json({
        message: "Successfully logged in an existing user",
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
      // console.log("Account already subscribed to Google by same email:", existingGoogleUser.email);
      // console.log("Updating OAuth ID for existing account");
      
      // 기존 사용자 정보 업데이트 (OAuth ID 변경)
      await existingGoogleUser.update({
        oauthid: oauthid,
        nickname: nickname || existingGoogleUser.nickname,
        profimg: profimg || existingGoogleUser.profimg
      });

      const accessToken = generateAccessToken(existingGoogleUser);
      
      return res.status(200).json({
        message: "Successfully logged in an existing user after updating Google account information",
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
      console.log("The same email is already subscribed to another OAuth provider:", existingUserWithSameEmail.email);

      return res.status(409).json({
        message: "This email is already subscribed.",
        error: `This email is already subscribed to the ${existingUserWithSameEmail.oauthprovider} account.`,
        existingProvider: existingUserWithSameEmail.oauthprovider
      });
    }

    // 4차: 완전 신규 사용자 생성
    console.log("Creating a completely new Google user");
    
    const newUser = await User.create({
      oauthprovider: oauthprovider,
      oauthid: oauthid,
      email: email,
      nickname: nickname || `Google User ${Date.now()}`,
      profimg: profimg || null,
      status: 1,
      role: 2,
      plan: 1
    });

    // console.log("Successfully created new user:", newUser.email);
    const accessToken = generateAccessToken(newUser);

    return res.status(201).json({
      message: "Successfully registered and logged in new user",
      user: {
        userid: newUser.userid,
        nickname: newUser.nickname,
        email: newUser.email,
        profimg: newUser.profimg
      },
      token: accessToken
    });

  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : "An error occurred while processing the login."
    });
  }
};

module.exports = {
  googleAuth,
};