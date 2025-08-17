// back/src/routes/notes.js
const router = require('express').Router();
const auth = require('../middlewares/auth') || {};
const note = require('../controllers/noteController');

const required = auth.required || auth.authRequired || auth.authenticate || ((req, _res, next) => next());
const adminOnly = auth.adminOnly || ((req, _res, next) => next());

router.post('/', required, note.createNote);
router.get('/:userid', required, note.getNotes);
router.put('/:noteid', required, note.updateNote);
router.delete('/:noteid', required, note.deleteNote);

// 전체 목록 (관리자)
router.get('/', required, adminOnly, note.getAllNotes);

module.exports = router;
