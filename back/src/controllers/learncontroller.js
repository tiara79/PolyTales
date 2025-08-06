// back/src/controllers/learncontroller.js
const { learn } = require('../models');

const getLearnPages = async (req, res) => {
  const { storyid } = req.params;
  const { lang } = req.query;
  // console.log('storyid:', storyid);
  // console.log('lang:', lang);
  // console.log('learn:', learn);

  try {
    const pages = await learn.findAll({
      where: {
        storyid,
        nation: lang || 'ko'
      },
      order: [['pagenumber', 'ASC']]
    });

    // 오디오 경로를 백엔드 서버 URL로 수정
    const processedPages = pages.map(page => {
      const pageData = page.toJSON();
      // 오디오 경로가 상대 경로인 경우 절대 경로로 변경
      if (pageData.audiopath && !pageData.audiopath.startsWith('http')) {
        // 경로에서 'public/' 부분 제거하고 백엔드 서버 URL 추가
        const cleanPath = pageData.audiopath.replace(/^.*public\//, '');
        pageData.audiopath = `http://localhost:3000/${cleanPath}`;
      }
      return pageData;
    });

    res.json(processedPages);
  } catch (err) {
    console.error('learn fetch error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getLearnPages };
