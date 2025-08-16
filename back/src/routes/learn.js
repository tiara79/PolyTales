const express = require('express');
const router = express.Router();
const db = require('../models');
const { toAudioUrl, toImgUrl } = require('../utils/pathFixers'); //  유틸 불러오기

// GET /learn/:storyid?lang=en
router.get('/:storyid', async (req, res) => {
  const storyid = req.params.storyid;
  const lang = req.query.lang;

  try {
    // 페이지 데이터
    const pages = await db.learn.findAll({
      where: { storyid, nation: lang },
      order: [['pagenumber', 'ASC']]
    });

    const processedPages = pages.map(page => {
      const o = page.toJSON();

      // 이미지, 오디오 경로 변환
      if (o.imagepath)  o.imagepath  = toImgUrl(o.imagepath);
      if (o.audiopath)  o.audiopath  = toAudioUrl(o.audiopath);

      return o;
    });

    // 문법/단어
    const language = await db.Language.findAll({
      where: { storyid, nation: lang }
    });

    res.json({ pages: processedPages, language });
  } catch (err) {
    console.error('learn get failed:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

module.exports = router;
