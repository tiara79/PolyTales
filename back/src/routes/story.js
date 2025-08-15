// src/routes/story.js
const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { authenticate } = require('../middlewares/auth');

// 관리자 모드 - 임시 주석 처리
const onlyAdmin = (req, res, next) => {
  // if (req.user?.role === 1) return next();
  // return res.status(403).json({ message: 'forbidden' });
  return next(); // 임시로 모든 요청 허용
};

// 레벨 파라미터 정규화 미들웨어
const normalizeLevel = (req, res, next) => {
  if (req.params.level) {
    // 소문자를 대문자로 변환하여 DB 조회용으로 사용
    req.params.level = req.params.level.toUpperCase();
  }
  next();
};

// === 조회 ===
router.get('/', storyController.getStories);
router.get('/levels', storyController.getAllLevels);
router.get('/level/:level', normalizeLevel, storyController.getStoryByLevel);
router.get('/:level/detail/:id', normalizeLevel, storyController.getStoryById);

// === 생성/수정/삭제 ===
router.post('/', authenticate, onlyAdmin, storyController.createStory);
router.put('/:level/detail/:id', authenticate, onlyAdmin, normalizeLevel, storyController.updateStory);
router.delete('/:level/detail/:id', authenticate, onlyAdmin, normalizeLevel, storyController.deleteStory);

module.exports = router;
