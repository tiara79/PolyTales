
const { learn } = require('../models');
const { toImgUrl, toAudioUrl } = require('../utils/pathFixers');

const getLearnPages = async (req, res) => {
  const { storyid } = req.params;
  const { lang } = req.query;
  try {
    const pages = await learn.findAll({
      where: { storyid, nation: lang || 'ko' },
      order: [['pagenumber', 'ASC']]
    });
    const processedPages = pages.map(page => {
      const p = page.toJSON();
      if (p.imagepath) p.imagepath = toImgUrl(p.imagepath);
      if (p.audiopath) p.audiopath = toAudioUrl(p.audiopath);
      return p;
    });
    res.json(processedPages);
  } catch (err) {
    console.error('learn fetch error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getLearnPages };
