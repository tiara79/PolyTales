// back/src/routes/profile.js
const express = require('express');
const router = express.Router();
const { uploadProfileImage, getProfile, withdrawUser } = require('../controllers/profileController');
const auth = require('../middlewares/auth') || {};
const upload = require('../middlewares/upload');

const authenticate = auth.authenticate || auth.required || auth.authRequired || ((req, _res, next) => next());

router.get('/', authenticate, getProfile);

router.post(
  '/upload-image',
  authenticate,
  upload.single('profileImage'),
  uploadProfileImage
);

router.delete('/withdraw', authenticate, withdrawUser);

module.exports = router;
