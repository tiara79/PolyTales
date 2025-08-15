const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');
const { authRequired } = require('../middlewares/auth');

// POST /tutor
router.post('/', tutorController.createMessage);

// GET /tutor/:storyid
router.get('/:storyid', tutorController.getMessagesByStory);

//  10개씩 최신순으로 오늘 작성된 user 1의 story 1 대화 조회
//http://localhost:3000/tutor/page/1?userid=1&limit=10&offset=0
router.get('/page/:storyid', tutorController.getPagedMessages);

// DELETE /tutor/:chatid
router.delete('/:chatid', tutorController.deleteMessage);

// 
router.get('/summary/:storyid', tutorController.getSummary);

// 새로운 채팅 API 추가
router.post('/chat', authRequired, tutorController.createChat);

module.exports = router;
