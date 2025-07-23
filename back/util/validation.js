// 설치 : npm i joi 
const Joi = require("joi"); // 데이터 유효성 검사도구 불러오기

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "유효한 이메일 형식이 아닙니다.",
    "string.empty": "이메일은 필수 입력 항목입니다.",
  }),
  password: Joi.string().min(6).max(30).required().messages({
    "string.min": "비밀번호는 최소 6자리 이상이어야 합니다.",
    "string.max": "비밀번호는 최대 30자까지만 가능합니다.",
    "string.empty": "비밀번호는 필수 입력항목 입니다.",
  }),
  name: Joi.string().min(2).max(10).required().messages({
    "string.min": "이름은 최소 2자리 이상입니다.",
    "string.max": "이름은 최대 10자리 까지 입니다.",
    "string.empty": "이름은 필수 입력 항목입니다.",
  }),
});

module.exports = {
  registerSchema,
};