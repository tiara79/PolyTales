// back/src/routes/language.js
const express = require('express');
const router = express.Router();
const {
  createLanguage,
  getLanguages,
  updateLanguage,
  deleteLanguage
} = require('../controllers/languageController');

// 쿼리(/language?storyid=1&nation=ko)와 파라미터(/language/1) 둘 다 지원
router.get('/', (req, res, next) => {
  req.params = req.params || {};
  if (!req.params.storyid && req.query.storyid) req.params.storyid = req.query.storyid;
  return getLanguages(req, res, next);
});

router.get('/:storyid', getLanguages);
router.post('/', createLanguage);
router.put('/:vocaid', updateLanguage);
router.delete('/:vocaid', deleteLanguage);

module.exports = router;
