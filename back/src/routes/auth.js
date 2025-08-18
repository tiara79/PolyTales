
// 회원가입, 로그인, 토큰검증 등을 처리하는 라우터

// back/src/routes/auth.js
const router = require('express').Router();
const { User } = require('../models');
const { googleAuth, naverAuth, naverCallback, kakaoAuth, kakaoCallback, register, login, me, naverUnlink } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validation');
const { authRequired } = require('../middlewares/auth');

// 중복 확인 헬퍼 함수
const createDuplicateCheckHandler = (field, errorMessage) => {
  return async (req, res) => {
    try {
      const value = req.query[field] || req.body[field];
      if (!value) {
        return res.status(400).json({ message: `${field} is required` });
      }
      
      const exists = await User.count({ where: { [field]: value } });
      
      // GET 요청: { exists: boolean } 형태로 응답
      if (req.method === 'GET') {
        return res.json({ exists: !!exists });
      }
      
      // POST 요청: 존재하면 에러, 없으면 성공 메시지
      if (exists) {
        return res.status(409).json({ message: errorMessage });
      }
      res.json({ message: `사용 가능한 ${field === 'username' ? '아이디' : field === 'email' ? '이메일' : '전화번호'}입니다.` });
    } catch (e) {
      console.error(`check-${field} error:`, e);
      res.status(500).json({ message: 'server error' });
    }
  };
};

// 중복 확인 라우트 (GET, POST 모두 지원)
const usernameHandler = createDuplicateCheckHandler('username', '이미 사용 중인 아이디입니다.');
const emailHandler = createDuplicateCheckHandler('email', '이미 사용 중인 이메일입니다.');
const phoneHandler = createDuplicateCheckHandler('phone', '이미 사용 중인 전화번호입니다.');

router.get('/check-username', usernameHandler);
router.post('/check-username', usernameHandler);
router.get('/check-email', emailHandler);
router.post('/check-email', emailHandler);
router.get('/check-phone', phoneHandler);
router.post('/check-phone', phoneHandler);

router.post('/google', googleAuth);                     // 구글 소셜 로그인
router.post('/naver', naverAuth);                       // 네이버 소셜 로그인
router.get('/naver/callback', naverCallback);           // 네이버 콜백(GET)
router.post('/naver/unlink', naverUnlink);              // 네이버 연결 해제(언링크)
router.post('/kakao', kakaoAuth);                       // 카카오 소셜 로그인
router.get('/kakao/callback', kakaoCallback);           // 카카오 콜백(GET)
router.post('/register', validateRegister, register);   // 로컬 회원가입
router.post('/login', validateLogin, login);            // 로컬 로그인
router.get('/me', authRequired, me);                    // 내 정보

// 토큰 검증(프론트 F5 시 세션 복구용)
router.post('/verify', authRequired, (req, res) => {
  // authRequired에서 최신 사용자 정보가 req.user에 세팅됨
  res.json({ ok: true, user: req.user });
});

module.exports = router;
