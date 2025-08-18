const multer = require('multer');

// Azure Blob Storage 사용을 위해 메모리 스토리지로 변경
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg','image/jpg','image/png','image/gif'];
  cb(allowed.includes(file.mimetype) ? null : new Error('이미지 파일만 업로드 가능합니다.'), allowed.includes(file.mimetype));
};

module.exports = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB 제한
});
