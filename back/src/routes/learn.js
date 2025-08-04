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

    // 오디오 경로를 백엔드 서버 URL로 수정
    const processedPages = pages.map(page => {
      const pageData = page.toJSON();
      console.log('원본 오디오 경로:', pageData.audiopath);
      
      // 오디오 경로가 상대 경로인 경우 절대 경로로 변경
      if (pageData.audiopath && !pageData.audiopath.startsWith('http')) {
        // 경로에서 'public/' 부분 제거하고 백엔드 서버 URL 추가
        let cleanPath = pageData.audiopath.replace(/^.*public\//, '');
        // 시작 슬래시 제거
        cleanPath = cleanPath.replace(/^\/+/, '');
        
        // 언어별 파일명 수정 - lily_1.mp3를 lily_1_ko.mp3로 변경
        if (cleanPath.includes('lily_') && !cleanPath.includes(`_${lang}.mp3`)) {
          cleanPath = cleanPath.replace('.mp3', `_${lang}.mp3`);
        }
        
        pageData.audiopath = `http://localhost:3000/${cleanPath}`;
        console.log('수정된 오디오 경로:', pageData.audiopath);
      }
      return pageData;
    });

    // ② 문법/단어(language) 데이터 가져오기
    const language = await db.Language.findAll({
      where: { storyid, nation: lang }
    });

    res.json({ pages: processedPages, language });
  } catch (err) {
    console.error('learn get 실패:', err);
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
