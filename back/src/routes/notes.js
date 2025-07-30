const express = require('express');
const router = express.Router();
const { createNote, getNotes } = require('../controllers/noteController');

//URL: http://localhost:3000/notes
router.post('/', createNote);
router.get('/:userid', getNotes); // userId별 조회

module.exports = router;
