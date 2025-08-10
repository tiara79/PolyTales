// back/src/controllers/profileController.js

const { User } = require('../models');
const path = require('path');
const fs = require('fs');

// 프로필 이미지 업로드
const uploadProfileImage = async (req, res) => {
  try {
    const myId = req.user.userid;
    if (!req.file) return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });

    const user = await User.findByPk(myId);
    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    // 기존 프로필 이미지 삭제하거나 기본 이미지가 아닌 경우
    if (user.profimg && user.profimg.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '../../', user.profimg);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const newProfileImg = `/uploads/profile/${req.file.filename}`;
    await user.update({ profimg: newProfileImg });

    res.json({ message: "ok", profimg: newProfileImg });
  } catch (error) {
    // 업로드된 파일 롤백
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "프로필 이미지 업로드 중 오류", error: error.message });
  }
};

// 프로필 정보 조회
const getProfile = async (req, res) => {
  try {
    const me = await User.findByPk(req.user.userid, {
      attributes: ['userid', 'username', 'nickname', 'email', 'profimg'] // createdat 제거(없다면)
    });
    if (!me) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    res.json({ user: me });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

// 회원 탈퇴 (status=4 권장: 4=탈퇴)
const withdrawUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userid);
    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    await user.update({ status: 4, updatedat: new Date() });
    res.json({ message: "회원 탈퇴가 완료되었습니다." });
  } catch (error) {
    res.status(500).json({ message: "회원 탈퇴 중 오류", error: error.message });
  }
};

module.exports = { uploadProfileImage, getProfile, withdrawUser };
