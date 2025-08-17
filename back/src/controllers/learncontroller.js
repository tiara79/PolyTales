// back/src/controllers/learnController.js
const { learn } = require('../models');

//  GET /learn/:storyid?lang=en
// - DB 원본 컬럼(imagepath/audiopath 등) 그대로 두되, 전역 normalizeMedia 미들웨어가 image/audio alias까지 채워 줌
const getLearnpage = async (req, res) => {
  const { storyid } = req.params;
  const { lang } = req.query;
  try {
    const rows = await learn.findAll({
      where: { storyid, nation: lang || 'ko' },
      order: [['pagenumber', 'ASC']],
    });

    // 그대로 반환(배열). normalizeMedia가 전체 트리를 보정하고 image/audio alias도 채움.
    const data = rows.map(r => r.toJSON());
    return res.json(data);
  } catch (err) {
    console.error('learn fetch error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getLearnpage };
