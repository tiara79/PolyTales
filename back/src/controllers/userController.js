// src/controllers/userController.js
const db = require("../models");
const { User } = db;

const VALID_STATUS = [1, 2, 3, 4]; // 1 정상, 2 경고, 3 강제삭제, 4 탈퇴

// 공통: body 에 문자 → 숫자 변환
const toNum = (v) => {
  if (v === undefined || v === null) return undefined;
  if (typeof v === 'string' && v.trim() === '') return undefined; // 공백만 → 제외
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined; // NaN/Infinity → 제외
};

// 전체 사용자 조회 (필터: status/role/plan)
// GET /users?status=1&role=2&plan=1
const getAllUsers = async (req, res) => {
  try {
    const { status, role, plan } = req.query;

    const where = {};
    const s = toNum(status);
    const r = toNum(role);
    const p = toNum(plan);

    if (s !== undefined) where.status = s;
    if (r !== undefined) where.role = r;
    if (p !== undefined) where.plan = p;

    const users = await User.findAll({
      where,
      attributes: ['userid','oauthprovider','email','nickname','status','role','plan'],
      order: [['userid', 'DESC']],
    });

    res.status(200).json({
      message: "Full User Lookup Success",
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 사용자별 조회 - GET /users/:userid
const getUserById = async (req, res) => {
  try {
    const id = toNum(req.params.userid);
    if (!id) return res.status(400).json({ message: "유효한 사용자 ID가 필요합니다." });

    const user = await User.findOne({
      where: { userid: id },
      attributes: ['userid','oauthprovider','email','nickname','profimg','status','role','plan','pay'],
    });

    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    res.status(200).json({ message: "사용자 조회 성공", data: user });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};


 // 사용자 생성 
 // POST /users, body: { oauthprovider, oauthid, email?, nickname?, profimg? }
const createUser = async (req, res) => {
  try {
    const { oauthprovider, oauthid, email, nickname, profimg } = req.body || {};

    if (!oauthprovider || !oauthid) {
      return res.status(400).json({ message: "OAuth 제공자와 ID는 필수입니다." });
    }

    // 복합 중복 체크 (oauthprovider + oauthid)
    const existing = await User.findOne({ where: { oauthprovider, oauthid } });
    if (existing) {
      return res.status(409).json({
        message: "이미 존재하는 사용자입니다.",
        data: { userid: existing.userid, email: existing.email, nickname: existing.nickname },
      });
    }

    const newUser = await User.create({
      oauthprovider,
      oauthid,
      email: email ?? null,
      nickname: nickname ?? null,
      profimg: profimg ?? null,
      status: 1, role: 2, plan: 1, pay: null,
    });

    res.status(201).json({
      message: "사용자 생성 성공",
      data: {
        userid: newUser.userid,
        oauthprovider: newUser.oauthprovider,
        email: newUser.email,
        nickname: newUser.nickname,
        status: newUser.status,
        role: newUser.role,
        plan: newUser.plan,
      },
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: "이미 존재하는 사용자입니다." });
    }
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

// 사용자 정보 업데이트 PATCH /users/:userid
const updateUserStatus = async (req, res) => {
  try {
    const id = toNum(req.params.userid);
    if (!id) return res.status(400).json({ message: "유효한 사용자 ID가 필요합니다." });

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    const updateData = {};
    const { status, role, plan, pay, email, nickname, profimg } = req.body || {};

    if (status !== undefined) {
      const ns = toNum(status);
      if (!VALID_STATUS.includes(ns)) return res.status(400).json({ message: "잘못된 status 값입니다." });
      updateData.status = ns;
    }
    if (role !== undefined)   updateData.role = toNum(role);
    if (plan !== undefined)   updateData.plan = toNum(plan);
    if (pay !== undefined)    updateData.pay  = toNum(pay);
    if (email !== undefined)  updateData.email = email;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (profimg !== undefined)  updateData.profimg  = profimg;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "업데이트할 필드가 없습니다." });
    }

    await User.update(updateData, { where: { userid: id } });

    const updated = await User.findOne({
      where: { userid: id },
      attributes: ['userid','oauthprovider','email','nickname','profimg','status','role','plan','pay'],
    });

    res.status(200).json({ message: "사용자 정보 업데이트 성공", data: updated });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

// 사용자 경고 처리 (1 → 2) PATCH /users/:userid/warn
const softDeleteUser = async (req, res) => {
  try {
    const id = toNum(req.params.userid);
    if (!id) return res.status(400).json({ message: "유효한 사용자 ID가 필요합니다." });

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    if (user.status === 1) {
      await User.update({ status: 2 }, { where: { userid: id } });
      return res.status(200).json({
        message: "사용자가 경고 상태로 변경되었습니다.",
        data: { userid: user.userid, previousStatus: 1, currentStatus: 2 },
      });
    }

    if (user.status === 2) return res.status(400).json({ message: "이미 경고 상태인 사용자입니다." });
    if (user.status === 3) return res.status(400).json({ message: "이미 삭제된 사용자입니다." });
    if (user.status === 4) return res.status(400).json({ message: "이미 탈퇴한 사용자입니다." });

    return res.status(400).json({ message: "처리할 수 없는 상태입니다." });
  } catch (error) {
    console.error("사용자 경고 처리 실패:", error);
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

// 사용자 강제삭제(=status 3) 처리 DELETE /users/:userid
const deleteUser = async (req, res) => {
  try {
    const id = toNum(req.params.userid);
    if (!id) return res.status(400).json({ message: "유효한 사용자 ID가 필요합니다." });

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    if (user.status === 3) {
      return res.status(400).json({ message: "이미 삭제된 사용자입니다." });
    }

    await User.update({ status: 3 }, { where: { userid: id } });

    res.status(200).json({
      message: "사용자가 삭제되었습니다.",
      data: { userid: user.userid, previousStatus: user.status, currentStatus: 3 },
    });
  } catch (error) {
    console.error("사용자 삭제 실패:", error);
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

// 관리자: 임의 상태 변경 API
// PATCH /users/:userid/status   body: { status, reason? }- 라우트에서 onlyAdmin 필요
const adminSetStatus = async (req, res) => {
  try {
    const id = toNum(req.params.userid);
    if (!id) return res.status(400).json({ message: "유효한 사용자 ID가 필요합니다." });

    const { status, reason } = req.body || {};
    const ns = toNum(status);
    if (!VALID_STATUS.includes(ns)) {
      return res.status(400).json({ message: "invalid status" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "user not found" });

    await user.update({ status: ns });
    return res.json({ message: 'ok', userid: user.userid, status: ns, reason: reason ?? null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'server error', error: e.message });
  }
};

// 관리자: 강제 탈퇴(=status 3)
// POST /users/:userid/force-withdraw 
const adminForceWithdraw = async (req, res) => {
  const id = Number(req.params.userid);
  const user = await db.User.findByPk(id);
  if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  if (user.status === 3) return res.status(400).json({ message: '이미 강제삭제 상태입니다.' });

  const prev = user.status;
  await user.update({ status: 3 });
  return res.json({ message: '강제 탈퇴 처리 완료', data: { userid: id, previousStatus: prev, currentStatus: 3 } });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserStatus,
  softDeleteUser,
  deleteUser,

  // Admin APIs
  adminSetStatus,
  adminForceWithdraw,
};
