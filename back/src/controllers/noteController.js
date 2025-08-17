// back/src/controllers/noteController.js
const db = require("../models");
const Note = db.Note || db.note; // 어떤 키로 export됐든 대응

// POST /notes (인증 필수)
const createNote = async (req, res) => {
  try {
    if (!req.user?.userid) return res.status(401).json({ message: "unauthorized" });

    const uid = req.user.userid;
    const {
      storyid,
      langlevel = null,
      lang = null,
      title,
      content,
      istutor = false, // ← 반드시 구조분해에 포함
    } = req.body || {};

    if (!storyid || !title || !content) {
      return res.status(400).json({ message: "storyid, title, content는 필수입니다." });
    }

    const newNote = await Note.create({
      userid: uid,
      storyid: Number(storyid),
      langlevel,
      lang,
      title,
      content,
      istutor: !!istutor,
    });

    res.status(201).json({ message: "ok", data: newNote });
  } catch (error) {
    console.error("Note create error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// GET /notes (관리자 전용; 필요 없으면 라우터에서 제외)
const getAllNotes = async (req, res) => {
  try {
    if (req.user?.role !== 1) return res.status(403).json({ message: "forbidden" });

    const notes = await Note.findAll({ order: [["createdat", "DESC"]] });
    res.json({ message: "ok", count: notes.length, data: notes });
  } catch (err) {
    console.error("Get all notes error:", err);
    res.status(500).json({ message: "Failed to retrieve all notes", error: err.message });
  }
};

// GET /notes/:userid (본인 + 관리자)
const getNotes = async (req, res) => {
  try {
    if (!req.user?.userid) return res.status(401).json({ message: "unauthorized" });

    const target = Number(req.params.userid);
    const me = req.user.userid;
    const admin = req.user.role === 1;
    if (!admin && target !== me) return res.status(403).json({ message: "forbidden" });

    const notes = await Note.findAll({
      where: { userid: target },
      order: [["createdat", "DESC"]],
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
    if (!req.user?.userid) return res.status(401).json({ message: "unauthorized" });

    const noteId = Number(req.params.noteid);
    const { title, content } = req.body || {};
    if (!title || !content) return res.status(400).json({ message: "Both title and content are required." });

    const note = await Note.findByPk(noteId);
    if (!note) return res.status(404).json({ message: "Note not found." });
    if (note.userid !== req.user.userid && req.user.role !== 1) return res.status(403).json({ message: "forbidden" });

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
    if (!req.user?.userid) return res.status(401).json({ message: "unauthorized" });

    const noteId = Number(req.params.noteid);
    const note = await Note.findByPk(noteId);
    if (!note) return res.status(404).json({ message: "Note not found." });
    if (note.userid !== req.user.userid && req.user.role !== 1) return res.status(403).json({ message: "forbidden" });

    await Note.destroy({ where: { noteid: noteId } });
    res.json({ message: "ok" });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

module.exports = { createNote, getNotes, getAllNotes, updateNote, deleteNote };
