//back/src/middlewares/validation.js
const Joi = require('joi');

// 회원가입
const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(4).max(12).required().messages({
      'string.alphanum': '아이디는 영문자와 숫자만 사용할 수 있습니다.',
      'string.min': '아이디는 최소 4자 이상이어야 합니다.',
      'string.max': '아이디는 최대 12자까지 가능합니다.',
      'any.required': '아이디를 입력해주세요.'
    }),
    password: Joi.string()
      .min(8).max(20)
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
      .required().messages({
        'string.min': '비밀번호는 최소 8자 이상이어야 합니다.',
        'string.max': '비밀번호는 최대 20자까지 가능합니다.',
        'string.pattern.base': '비밀번호는 영문자, 숫자, 특수문자(@$!%*?&)를 모두 포함해야 합니다.',
        'any.required': '비밀번호를 입력해주세요.'
      }),
    email: Joi.string().email().required().messages({
      'string.email': '올바른 이메일 형식이 아닙니다.',
      'any.required': '이메일을 입력해주세요.'
    }),
    phone: Joi.string()
      .pattern(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/)
      .optional().messages({
        'string.pattern.base': '올바른 전화번호 형식이 아닙니다.'
      }),
    nickname: Joi.string().min(2).max(20).optional(),
    terms: Joi.array().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: '입력값 검증 실패', details: error.details[0].message });
  next();
};

// 로그인
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().required().messages({ 'any.required': '아이디를 입력해주세요.' }),
    password: Joi.string().required().messages({ 'any.required': '비밀번호를 입력해주세요.' })
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: '입력값 검증 실패', details: error.details[0].message });
  next();
};

module.exports = { validateRegister, validateLogin };
