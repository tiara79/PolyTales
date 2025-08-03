const express = require('express');
const router = express.Router();
const db = require('../models');

// GET /learn/:storyid?lang=en
router.get('/:storyid', async (req, res) => {
  const storyid = req.params.storyid;
  const lang = req.query.lang;

  try {
    // ① 페이지 데이터 가져오기
    const pages = await db.learn.findAll({
      where: { storyid, nation: lang },
      order: [['pagenumber', 'ASC']]
    });

    // ② 문법/단어(language) 데이터 가져오기
    const language = await db.Language.findAll({
      where: { storyid, nation: lang }
    });

    res.json({ pages, language });
  } catch (err) {
    console.error('learn get 실패:', err);
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
