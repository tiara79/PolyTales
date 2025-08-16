const db = require('../models');
const Language = db.Language;

// 문법/단어 추가
const createLanguage = async (req, res) => {
  try {
    const newItem = await Language.create(req.body);
    res.status(201).json({ message: 'created', data: newItem });
  } catch (err) {
    res.status(500).json({ message: 'create failed', error: err.message });
  }
};

// 특정 스토리의 문법/단어 전체 조회
const getLanguages = async (req, res) => {
  try {
    const result = await Language.findAll({ where: { storyid: req.params.storyid } });
    res.json({ message: 'ok', data: result });
  } catch (err) {
    res.status(500).json({ message: 'get failed', error: err.message });
  }
};

// 문법/단어 수정
const updateLanguage = async (req, res) => {
  try {
    const updated = await Language.update(req.body, { where: { vocaid: req.params.vocaid } });
    res.json({ message: 'updated', data: updated });
  } catch (err) {
    res.status(500).json({ message: 'update failed', error: err.message });
  }
};

// 문법/단어 삭제
const deleteLanguage = async (req, res) => {
  try {
    await Language.destroy({ where: { vocaid: req.params.vocaid } });
    res.json({ message: 'deleted' });
  } catch (err) {
    res.status(500).json({ message: 'delete failed', error: err.message });
  }
};

module.exports = {
  createLanguage,
  getLanguages,
  updateLanguage,
  deleteLanguage
};
