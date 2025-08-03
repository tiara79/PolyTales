const express = require('express');
const router = express.Router();
const { createLanguage, getLanguages, updateLanguage, deleteLanguage } = require('../controllers/languageController');

router.post('/', createLanguage);
router.get('/:storyid', getLanguages);
router.put('/:vocaid', updateLanguage);
router.delete('/:vocaid', deleteLanguage);

module.exports = router;
