// back/src/routes/story.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const storyController = require('../controllers/storyController');
const auth = require('../middlewares/auth');

const required = auth.required || auth.authRequired || auth.authenticate || ((req, _res, next) => next());

// 토큰이 있으면 req.user를 채우고, 없어도 통과
const softAuth = (req, _res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch (_) {}
  }
  next();
};

router.get('/', storyController.getStories);
router.get('/levels', storyController.getAllLevels);
router.get('/level/:level', softAuth, storyController.getStoryByLevel);
router.get('/:level/detail/:id', storyController.getStoryById);

router.post('/', required, storyController.createStory);
router.put('/:level/detail/:id', required, storyController.updateStory);
router.delete('/:level/detail/:id', required, storyController.deleteStory);

module.exports = router;
