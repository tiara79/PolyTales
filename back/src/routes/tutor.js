// back/src/routes/tutor.js

const router = require('express').Router();

const router = express.Router();
const tutor = require('../controllers/tutorController');

router.post("/chat", tutorController.createChat);


// 필요 시 아래도 정책에 맞춰 해제
// const auth = require('../middlewares/auth');
// const required = auth.required || auth.authRequired || auth.authenticate || ((req, _res, next) => next());

// router.post('/chat', required, tutor.createChat);

// router.post('/messages', required, tutor.createMessage);
// router.get('/messages/:storyid', required, tutor.getMessagesByStory);
// router.delete('/messages/:id', required, tutor.deleteMessage);
// router.get('/summary/:storyid', required, tutor.getSummary);
// router.get('/messages/:storyid/page/:page', required, tutor.getPagedMessages);

module.exports = router;
