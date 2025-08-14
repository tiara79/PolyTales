const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const uploadPath = path.join(__dirname, '../../../front/public/img/uploads');

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadPath),
  filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// 프로필 이미지 업로드
router.post('/', upload.single('profileImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '업로드 실패: 파일이 없습니다.' });
  }
  res.json({
    message: '업로드 성공',
    filename: req.file.filename,
    url: `/img/uploads/${req.file.filename}`
  });
});

module.exports = router;
