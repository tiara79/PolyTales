const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

// POST /note
router.post('/note', noteController.createNote);
// GET /note/:userid
router.get('/note/:userid', noteController.getNote);
// GET /note (관리자)
router.get('/note', noteController.getAllNote);
// PUT /note/:noteid
router.put('/note/:noteid', noteController.updateNote);
// DELETE /note/:noteid
router.delete('/note/:noteid', noteController.deleteNote);

module.exports = router;