const db = require("../models");

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

        const newNote = await db.Note.create({
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

module.exports = {
    createNote,
    getNotes
};