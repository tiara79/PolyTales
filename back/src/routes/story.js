const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

// GET /stories
router.get('/', storyController.getStories);

// GET /stories/:id
router.get('/:id', storyController.getStoryById);

// GET URL: http://localhost:3000/stories/level/A1
router.get('/level/:level', storyController.getStoryByLevel);

module.exports = router;
