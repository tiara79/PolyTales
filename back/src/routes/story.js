// src/routes/story.js 
const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

// === 조회 관련 ===
// GET /stories - 전체 스토리 목록 조회 (예: 40개)
router.get('/', storyController.getStories);

// GET /stories/levels - 레벨별 목록 조회 (예: 6개)
router.get('/levels', storyController.getAllLevels);

// GET /stories/level/A1 - A1 레벨의 모든 스토리 조회  
router.get('/level/:level', storyController.getStoryByLevel);

// GET /stories/A1/detail/1 - 특정 레벨의 특정 스토리 상세
router.get('/:level/detail/:id', storyController.getStoryById);


// === 생성/수정/삭제 관련 ===
// POST /stories - 새 스토리 생성 
router.post('/', storyController.createStory);

// PUT /stories/A1/detail/1 - 스토리 수정
router.put('/:level/detail/:id', storyController.updateStory);

// DELETE /stories/A1/detail/1 - 스토리 삭제  
router.delete('/:level/detail/:id', storyController.deleteStory);

module.exports = router;