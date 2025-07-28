// file: back/routes/notes.js

const express = require("express");
const router = express.Router();
const noteController = require("../controllers/notes");
const { getNotesByMonth } = require("../controllers/notes");
//  /notes/month/6 → 6월 전체 메모 조회
router.get("/month/:month", getNotesByMonth);

// http://localhost:3000/notes
router.post("/", noteController.createnote);
router.get("/", noteController.findAllnotes);
router.get("/:id", noteController.findnote);
router.put("/:id", noteController.updatenote);
router.delete("/:id", noteController.deletenote);



module.exports = router;