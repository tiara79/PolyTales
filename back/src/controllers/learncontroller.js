// back/src/controllers/learnController.js
const { learn } = require('../models');


// img : img\a1\lily
// audio : audio\a1\lily
// 자막 : storylearn 테이블 caption 
// 언어 : storylearn 테이블 nation

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
