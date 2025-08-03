const express = require('express');
const router = express.Router();
const {
  createNote,
  getNotes,
  getAllNotes,      
  updateNote,
  deleteNote
} = require('../controllers/noteController');

//URL: http://localhost:3000/notes
router.get('/', getAllNotes); // 전체 노트 조회
router.get('/:userid', getNotes); // 사용자 노트 조회
router.post('/', createNote); // 노트 생성
router.put('/:noteid', updateNote); // 노트 수정
router.delete('/:noteid', deleteNote); // 노트 삭제

module.exports = router;
