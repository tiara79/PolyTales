// src/routes/story.js
const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { authenticate } = require('../middlewares/auth');

// 관리자 모드
const onlyAdmin = (req, res, next) => {
  if (req.user?.role === 1) return next();
  return res.status(403).json({ message: 'forbidden' });
};

// === 조회 ===
router.get('/', storyController.getStories);
router.get('/levels', storyController.getAllLevels);
router.get('/level/:level', storyController.getStoryByLevel);
router.get('/:level/detail/:id', storyController.getStoryById);

// === 생성/수정/삭제 ===
router.post('/', authenticate, onlyAdmin, storyController.createStory);
router.put('/:level/detail/:id', authenticate, onlyAdmin, storyController.updateStory);
router.delete('/:level/detail/:id', authenticate, onlyAdmin, storyController.deleteStory);

module.exports = router;
