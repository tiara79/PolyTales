// File: back/routes/auth.js
//백엔드에서 회원가입과 로그인 요청을 처리하는 라우터

const router = require('express').Router();

const { googleAuth, register, login, me } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validation');
const { authRequired } = require('../middlewares/auth');

// 디버그 체크
console.log('[auth route] ctrl= {googleAuth, login, me} ok');
console.log('[auth route] typeof validateLogin =', typeof validateLogin);
console.log('[auth route] typeof authRequired =', typeof authRequired);

router.post('/google', googleAuth);                     // 소셜
router.post('/register', validateRegister, register);   // 로컬 가입
router.post('/login', validateLogin, login);            // 로컬 로그인
router.get('/me', authRequired, me);                    // 내 정보

module.exports = router;

