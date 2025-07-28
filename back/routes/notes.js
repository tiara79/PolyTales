const express = require('express');
const router = express.Router();
const { createNote, getNotes } = require('../controllers/noteController');

router.post('/', createNote);
router.get('/:userId', getNotes); // userId별 조회

module.exports = router;
