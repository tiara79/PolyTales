// back/src/routes/learn.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const { toAudioUrl, toImgUrl } = require('../util/pathFixers');

// GET /learn/:storyid?lang=en
router.get('/:storyid', async (req, res) => {
  const storyid = req.params.storyid;
  const lang = req.query.lang;

  try {
    const pages = await db.learn.findAll({
      where: { storyid, nation: lang },
      order: [['pagenumber', 'ASC']]
    });

    const processed = pages.map((row) => {
      const o = row.toJSON();

      // 가능한 모든 후보 키에서 경로를 뽑아 image/audio 필드에 정규화하여 담는다
      const imgRaw = o.image || o.img || o.imagepath || o.imgpath || o.picture || o.thumbnail || o.storycoverpath || o.cover;
      const audRaw = o.audio || o.audiopath || o.sound || o.movie || o.mp3;

      const imgUrl = imgRaw ? toImgUrl(imgRaw) : '';
      const audUrl = audRaw ? toAudioUrl(audRaw) : '';

      return {
        ...o,
        image: imgUrl || o.image || '',
        audio: audUrl || o.audio || '',
        imagepath: imgUrl || o.imagepath || o.imgpath || '',
        audiopath: audUrl || o.audiopath || '',
      };
    });

    // 문법/단어
    const language = await db.Language.findAll({
      where: { storyid, nation: lang }
    });

    res.json({ page: processed, language });
  } catch (err) {
    console.error('learn get failed:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
