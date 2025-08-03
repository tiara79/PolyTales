const express = require('express');
const router = express.Router();

const { getLearnPages } = require('../controllers/learncontroller');

router.get('/:storyid', getLearnPages);

module.exports = router;
