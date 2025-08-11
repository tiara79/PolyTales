// File: back/routes/auth.js
//백엔드에서 회원가입과 로그인 요청을 처리하는 라우터

const router = require('express').Router();
const { User } = require('../models');

const { googleAuth, register, login, me } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validation');
const { authRequired } = require('../middlewares/auth');

// 디버그 체크
// console.log('[auth route] ctrl= {googleAuth, login, me} ok');
// console.log('[auth route] typeof validateLogin =', typeof validateLogin);
// console.log('[auth route] typeof authRequired =', typeof authRequired);

// 아이디 중복 확인
router.get('/check-username', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ message: 'username is required' });
    const exists = await User.count({ where: { username } });
    res.json({ exists: !!exists });
  } catch (e) {
    console.error('check-username error:', e);
    res.status(500).json({ message: 'server error' });
  }
});

// 이메일 중복 확인
router.get('/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email is required' });
    const exists = await User.count({ where: { email } });
    res.json({ exists: !!exists });
  } catch (e) {
    console.error('check-email error:', e);
    res.status(500).json({ message: 'server error' });
  }
});

// 전화번호 중복 확인
router.get('/check-phone', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ message: 'phone is required' });
    const exists = await User.count({ where: { phone } });
    res.json({ exists: !!exists });
  } catch (e) {
    console.error('check-phone error:', e);
    res.status(500).json({ message: 'server error' });
  }
});

router.post('/google', googleAuth);                     // 소셜
router.post('/register', validateRegister, register);   // 로컬 가입
router.post('/login', validateLogin, login);            // 로컬 로그인
router.get('/me', authRequired, me);                    // 내 정보

module.exports = router;

