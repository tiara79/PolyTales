// back/src/controllers/noteController.js
// req.user.userid 사용, 관리자 예외 허용

const db = require("../models");
const Note = db.Note;

// POST /notes - 노트 생성
const createNote = async (req, res) => {
  try {
    const uid = req.user.userid; // 토큰의 사용자 id
    const { storyid, title, content } = req.body;

    if (!storyid || !title || !content) {
      return res.status(400).json({ message: "storyid, title, content는 필수입니다." });
    }

    const newNote = await Note.create({ userid: uid, storyid, title, content });
    res.status(201).json({ message: "ok", data: newNote });
  } catch (error) {
    console.error("Note create error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// GET /notes - 전체 노트
const getAllNotes = async (_req, res) => {
  try {
    const notes = await Note.findAll();
    res.json({ message: 'ok', count: notes.length, data: notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve all notes' });
  }
};

// GET /notes/:userid - 사용자별 노트
const getNotes = async (req, res) => {
  try {
    const target = parseInt(req.params.userid, 10);
    const me = req.user.userid;
    const admin = req.user.role === 1;

    if (!admin && target !== me) {
      return res.status(403).json({ message: "forbidden" });
    }

    const notes = await Note.findAll({
      where: { userid: target },
      order: [['noteid', 'DESC']]
    });
    res.json({ message: "ok", count: notes.length, data: notes });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// PUT /notes/:noteid
const updateNote = async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteid, 10);
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Both title and content are required." });

    // 사용자 또는 관리자만
    const note = await Note.findByPk(noteId);
    if (!note) return res.status(404).json({ message: "Note not found." });
    if (note.userid !== req.user.userid && req.user.role !== 1) return res.status(403).json({ message: 'forbidden' });

    await Note.update({ title, content }, { where: { noteid: noteId } });
    res.json({ message: "ok" });
  } catch (err) {
    console.error("Update note error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// DELETE /notes/:noteid
const deleteNote = async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteid, 10);

    // 사용자 또는 관리자만
    const note = await Note.findByPk(noteId);
    if (!note) return res.status(404).json({ message: "Note not found." });
    if (note.userid !== req.user.userid && req.user.role !== 1) return res.status(403).json({ message: 'forbidden' });

    await Note.destroy({ where: { noteid: noteId } });
    res.json({ message: "ok" });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

module.exports = { createNote, getNotes, getAllNotes, updateNote, deleteNote };
