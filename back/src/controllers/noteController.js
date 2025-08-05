const db = require("../models");
const Note = db.Note;

// POST /notes - 노트 생성
const createNote = async (req, res) => {
    try {
        // console.log(' Start the createNote function');
        // console.log(' request data :', req.body);
        
        const { userid, storyid, title, content } = req.body;

        // 모든 필드 유효성 검사
        if (!userid || !storyid || !title || !content) {
            return res.status(400).json({ 
                message: "모든 항목을 입력해주세요." 
            });
        }

        const newNote = await notes.create({
            userid: userid,
            storyid: storyid,
            title: title,
            content: content
        });

        console.log(' Note creation successful:', newNote.noteid);

        res.status(201).json({
            message: "Note has been successfully created.",
            data: newNote
        });
    } catch (error) {
        console.error(" Note creation failed:", error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
};
//  GET /notes - 전체 노트 조회
const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.findAll();
    res.json({ message: 'ok', count: notes.length, data: notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve all notes' });
  }
};

// GET /notes/:userid - 사용자별 노트 조회
const getNotes = async (req, res) => {
    try {
        console.log(' Start the getNotes function');

        const { userid } = req.params;
        console.log(' User ID to retrieve:', userid);

        // userid 유효성 검사
        if (!userid) {
            return res.status(400).json({ 
                message: "User ID is required." 
            });
        }

        const notes = await db.Note.findAll({
            where: { userid: userid },  // 소문자 컬럼명
            order: [['noteid', 'DESC']]  // 최신순 정렬
        });

        console.log(' Number of retrieved notes:', notes.length);

        res.status(200).json({
            message: "ok",
            count: notes.length,
            data: notes
        });
    } catch (error) {
        console.error("Failed to retrieve notes:", error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

// PUT /notes/:noteid - 노트 수정
const updateNote = async (req, res) => {
  try {
    const noteId = req.params.noteid;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Both title and content are required." });
    }

    const updated = await db.Note.update(
      { title, content },
      { where: { noteid: noteId } }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ message: "Note not found." });
    }

    res.json({ message: "Note has been successfully updated." });
  } catch (err) {
    console.error("Failed to update note:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// DELETE /notes/:noteid - 노트 삭제
const deleteNote = async (req, res) => {
  try {
    const noteId = req.params.noteid;

    const deleted = await db.Note.destroy({ where: { noteid: noteId } });

    if (deleted === 0) {
      return res.status(404).json({ message: "Note not found." });
    }

    res.json({ message: "Note has been successfully deleted." });
  } catch (err) {
    console.error("Failed to delete note:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};



module.exports = {
    createNote,
    getNotes,
    getAllNotes,
    updateNote,
    deleteNote
};