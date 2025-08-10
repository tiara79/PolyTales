// back/src/routes/notes.js

const express = require('express');
const router = express.Router();
const {
  createNote,
  getNotes,
  getAllNotes,
  updateNote,
  deleteNote
} = require('../controllers/noteController');

// 인증 미들웨어
const { authRequired, onlyAdmin } = require('../middlewares/auth');

// 전체(관리자)
router.get('/', authRequired, onlyAdmin, getAllNotes);

// 사용자 노트 조회 (본인/관리자)
router.get('/:userid', authRequired, getNotes);

// 생성/수정/삭제는 로그인 필요
router.post('/', authRequired, createNote);
router.put('/:noteid', authRequired, updateNote);
router.delete('/:noteid', authRequired, deleteNote);

module.exports = router;
