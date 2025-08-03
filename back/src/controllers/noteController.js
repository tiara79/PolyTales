const db = require("../models");
const Note = db.Note;

// POST /notes - 노트 생성
const createNote = async (req, res) => {
    try {
        console.log(' createNote 함수 시작');
        console.log(' request data :', req.body);
        
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

        console.log(' 노트 생성 성공:', newNote.noteid);

        res.status(201).json({
            message: "노트가 성공적으로 생성되었습니다.",
            data: newNote
        });
    } catch (error) {
        console.error(" 노트 생성 실패:", error);
        res.status(500).json({ 
            message: "서버 오류", 
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
    res.status(500).json({ message: '노트 전체 조회 실패' });
  }
};

// GET /notes/:userid - 사용자별 노트 조회
const getNotes = async (req, res) => {
    try {
        console.log(' getNotes 함수 시작');
        
        const { userid } = req.params;
        console.log(' 조회할 userid:', userid);

        // userid 유효성 검사
        if (!userid) {
            return res.status(400).json({ 
                message: "사용자 ID가 필요합니다." 
            });
        }

        const notes = await db.Note.findAll({
            where: { userid: userid },  // 소문자 컬럼명
            order: [['noteid', 'DESC']]  // 최신순 정렬
        });

        console.log(' 조회된 노트 개수:', notes.length);

        res.status(200).json({
            message: "ok",
            count: notes.length,
            data: notes
        });
    } catch (error) {
        console.error("노트 조회 실패:", error);
        res.status(500).json({ 
            message: "서버 오류", 
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
      return res.status(400).json({ message: "제목과 내용을 모두 입력하세요." });
    }

    const updated = await db.Note.update(
      { title, content },
      { where: { noteid: noteId } }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ message: "노트를 찾을 수 없습니다." });
    }

    res.json({ message: "노트가 성공적으로 수정되었습니다." });
  } catch (err) {
    console.error("노트 수정 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// DELETE /notes/:noteid - 노트 삭제
const deleteNote = async (req, res) => {
  try {
    const noteId = req.params.noteid;

    const deleted = await db.Note.destroy({ where: { noteid: noteId } });

    if (deleted === 0) {
      return res.status(404).json({ message: "노트를 찾을 수 없습니다." });
    }

    res.json({ message: "노트가 성공적으로 삭제되었습니다." });
  } catch (err) {
    console.error("노트 삭제 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};



module.exports = {
    createNote,
    getNotes,
    getAllNotes,
    updateNote,
    deleteNote
};