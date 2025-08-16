const { User } = require('../models');

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }

    const fileName = req.file.filename;
    const blobBase = process.env.BLOB_URL;
    const container = process.env.BLOB_CONTAINER_PROFILE || "profile";

    await User.update(
      { profimg: fileName },
      { where: { userid: req.user.userid } }
    );

    res.json({
      message: '프로필 이미지 업로드 성공',
      profimg: fileName,
      url: `${blobBase}/${container}/${fileName}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '프로필 이미지 업로드 실패' });
  }
};
module.exports = {
  uploadProfileImage
}