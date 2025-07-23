// back/util/token.js
const jwt = require("jsonwebtoken");

const generateAccessToken = (user) =>{
  return jwt.sign({
     //페이로드 :토큰에 담길 유저 정보
    id: user.id,
    email: user.email,
  },
   // 만료일 30d : 30일 , // 토큰 서명키, 이 키를 이용해서 토큰의 유효성을 검증 
  "access_token", {expiresIn: "30d"} 
 );
};
module.exports ={
  generateAccessToken,
};