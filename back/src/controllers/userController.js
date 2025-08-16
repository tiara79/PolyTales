// src/controllers/userController.js

// src/controllers/userController.js

const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { toImgUrl } = require('../utils/pathFixers');

// 전체 조회
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    const result = users.map(user => {
      const u = user.toJSON();
      if (u.profimg) u.profimg = toImgUrl(`profile/${u.profimg}`);
      return u;
    });
    res.status(200).json({ message: '전체 사용자 조회 성공', data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '사용자 목록 조회 실패' });
  }
};

// 단일 조회
const getUserById = async (req, res) => {
  try {
    const userid = req.params.userid;
    const user = await User.findByPk(userid);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    const result = user.toJSON();
    if (result.profimg) result.profimg = toImgUrl(`profile/${result.profimg}`);
    res.status(200).json({ message: '사용자 조회 성공', data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '사용자 조회 실패' });
  }
};

// 생성
const createUser = async (req, res) => {
  try {
    const { email, nickname, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, nickname, password: hashedPassword });
    const result = user.toJSON();
    if (result.profimg) result.profimg = toImgUrl(`profile/${result.profimg}`);
    res.status(201).json({ message: '사용자 생성 성공', data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '사용자 생성 실패' });
  }
};

// 상태 업데이트
const updateUserStatus = async (req, res) => {
  try {
    const { userid } = req.params;
    const { status } = req.body;
    await User.update({ status }, { where: { userid } });
    const updatedUser = await User.findByPk(userid);
    if (!updatedUser) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    const result = updatedUser.toJSON();
    if (result.profimg) result.profimg = toImgUrl(`profile/${result.profimg}`);
    res.status(200).json({ message: '사용자 상태 업데이트 성공', data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '상태 업데이트 실패' });
  }
};

// 삭제
const deleteUser = async (req, res) => {
  try {
    const { userid } = req.params;
    const deleted = await User.destroy({ where: { userid } });
    if (!deleted) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.status(200).json({ message: '사용자 삭제 성공' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '사용자 삭제 실패' });
  }
};

// 3번: 강제 탈퇴 (관리자가 상태 3으로)
const adminForceWithdraw = async (req, res) => {
  try {
    const { userid } = req.params;
    const user = await User.findByPk(userid);
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

    user.status = 3; // 강제 탈퇴
    await user.save();
    res.json({ message: '강제 탈퇴 완료', userid });
  } catch (err) {
    console.error("adminForceWithdraw error:", err);
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

// 4번: 사용자 본인 탈퇴
const userWithdraw = async (req, res) => {
  try {
    const { userid } = req.params;

    if (parseInt(req.user.userid) !== parseInt(userid)) {
      return res.status(403).json({ message: '본인만 탈퇴할 수 있습니다.' });
    }

    const user = await User.findByPk(userid);
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

    user.status = 4;
    await user.save();

    res.json({ message: '정상적으로 탈퇴 처리되었습니다.', userid });
  } catch (error) {
    console.error("userWithdraw error:", error);
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
};

// 상태만 변경 (관리자)
const adminSetStatus = async (req, res) => {
  try {
    const { userid } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(userid);
    if (!user) return res.status(404).json({ message: '사용자 없음' });

    user.status = status;
    await user.save();

    res.json({ message: '상태 변경 완료', status });
  } catch (error) {
    console.error("adminSetStatus error:", error);
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
};

// soft delete (status 2)
const softDeleteUser = async (req, res) => {
  try {
    const { userid } = req.params;
    const user = await User.findByPk(userid);
    if (!user) return res.status(404).json({ message: '사용자 없음' });

    user.status = 2;
    await user.save();
    res.json({ message: '사용자 비활성화 완료', userid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '비활성화 실패', error: err.message });
  }
};

module.exports = {
  adminSetStatus,
  adminForceWithdraw,
  getUserById,
  getUsers,
  createUser,
  updateUserStatus,
  softDeleteUser,
  deleteUser,
  userWithdraw,
};
