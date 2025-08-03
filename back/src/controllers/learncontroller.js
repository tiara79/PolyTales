// back/src/controllers/learncontroller.js
const { learn } = require('../models');

const getLearnPages = async (req, res) => {
  const { storyid } = req.params;
  const { lang } = req.query;
  console.log('storyid:', storyid);
  console.log('lang:', lang);
  console.log('learn:', learn);

  try {
    const pages = await learn.findAll({
      where: {
        storyid,
        nation: lang || 'ko'
      },
      order: [['pagenumber', 'ASC']]
    });

    res.json(pages);
  } catch (err) {
    console.error('learn fetch error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getLearnPages };
