// back/src/routes/tutor.js
const router = require('express').Router();
const auth = require('../middlewares/auth');
const tutor = require('../controllers/tutorController');

const required = auth.required || auth.authRequired || auth.authenticate || ((req, _res, next) => next());

router.post('/chat', required, tutor.createChat);

// 필요 시 아래도 정책에 맞춰 해제
// router.post('/messages', required, tutor.createMessage);
// router.get('/messages/:storyid', required, tutor.getMessagesByStory);
// router.delete('/messages/:id', required, tutor.deleteMessage);
// router.get('/summary/:storyid', required, tutor.getSummary);
// router.get('/messages/:storyid/page/:page', required, tutor.getPagedMessages);

module.exports = router;
