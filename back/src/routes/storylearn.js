const express = require('express');
const router = express.Router();
const { Story, StoryLearn } = require('../models'); // storylearn 테이블 추가

// 특정 이야기의 학습 정보 조회
router.get('/storylearn/:storyid', async (req, res) => {
  const { storyid } = req.params;

  try {
    // storylearn 테이블에서 데이터 조회
    const storyLearnData = await StoryLearn.findOne({
      where: { storyid },
    });

    if (!storyLearnData) {
      // 데이터가 없으면 404 응답
      return res.status(404).json({ message: '학습 정보를 찾을 수 없습니다.' });
    }

    // 조회된 데이터 응답
    return res.json(storyLearnData);
  } catch (error) {
    console.error('storylearn 데이터 조회 오류:', error);
    return res.status(500).json({ message: '서버 오류' });
  }
});

// ...기타 라우터 핸들러

module.exports = router;