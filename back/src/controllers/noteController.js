const { Note } = require('../models');

exports.createNote = async (req, res) => {
  try {
    const { userId, storyId, title, content } = req.body;

    if (!userId || !storyId || !title || !content) {
      return res.status(400).json({ message: '모든 항목을 입력해주세요.' });
    }

    const newNote = await Note.create({ userId, storyId, title, content });
    res.status(201).json(newNote);
  } catch (err) {
    console.error('노트 저장 실패:', err);
    res.status(500).json({ message: '노트 저장 중 오류 발생' });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    const notes = await Note.findAll({ where: { userId } });
    res.json(notes);
  } catch (err) {
    console.error('노트 조회 실패:', err);
    res.status(500).json({ message: '노트 조회 중 오류 발생' });
  }
};
