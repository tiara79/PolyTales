const express = require('express');
const router = express.Router();
const { uploadProfileImage, getProfile, withdrawUser } = require('../controllers/profileController');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// 프로필 정보 조회
router.get('/', authenticate, getProfile);

// 프로필 이미지 업로드
router.post('/upload-image',
    authenticate,
    upload.single('profileImage'),
    uploadProfileImage
);

// 회원 탈퇴
router.delete('/withdraw', authenticate, withdrawUser);

module.exports = router;
