const express = require("express");
const router = express.Router();
const noteController = require("../controllers/notes");

// http://localhost:3000/notes/notes
router.post("/", noteController.createNote);
router.get("/", noteController.getAllNotes);
router.get("/:tag", noteController.getNotes);
router.put("/:id", noteController.updateNote);
router.delete("/:id", noteController.deleteNote);

module.exports = router;