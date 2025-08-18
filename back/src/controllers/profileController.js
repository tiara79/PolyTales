const { User } = require('../models');
const { uploadProfileImageToAzure } = require('../utils/azureBlob');

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }

    const userid = req.user.userid;
    const fileBuffer = req.file.buffer;
    const fileName = `${userid}_${Date.now()}_${req.file.originalname}`;
    const url = await uploadProfileImageToAzure(fileBuffer, fileName, req.file.mimetype);

    await User.update(
      { profimg: url },
      { where: { userid: userid } }
    );

    res.json({
      message: '프로필 이미지 업로드 성공',
      profimg: url,
      url
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '프로필 이미지 업로드 실패' });
  }
};

module.exports = {
  uploadProfileImage
}