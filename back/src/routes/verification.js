const express = require('express');
const router = express.Router();
const {
    sendEmailVerification,
    verifyEmailCode,
    sendPhoneVerification,
    verifyPhoneCode
} = require('../controllers/verificationController');

// 이메일 인증번호 발송------------------------------------------------
router.post('/email/send', sendEmailVerification);

// 이메일 인증번호 확인
router.post('/email/verify', verifyEmailCode);


// 핸드폰 인증번호 발송------------------------------------------------
router.post('/phone/send', sendPhoneVerification);

// 핸드폰 인증번호 확인
router.post('/phone/verify', verifyPhoneCode);

module.exports = router;
