// src/controllers/userController.js
const db = require("../models");

// 전체 사용자 조회
const getAllUsers = async (req, res) => {
    try {
        const { status, role, plan } = req.query;
        
        // 필터 조건 구성
        const whereCondition = {};
        if (status) whereCondition.status = status;
        if (role) whereCondition.role = role;
        if (plan) whereCondition.plan = plan;

        const users = await db.User.findAll({
            where: whereCondition,
            attributes: ['userid', 'oauthprovider', 'email', 'nickname', 'status', 'role', 'plan'],
            order: [['userid', 'DESC']]
        });

        res.status(200).json({
            message: "Full User Lookup Success",
            count: users.length,
            data: users
        });
    } catch (error) {
        // console.error("Failed to retrieve all users:", error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

// 사용자 조회
const getUserById = async (req, res) => {
    try {
        const { userid } = req.params;
        
        if (!userid || isNaN(userid)) {
            return res.status(400).json({ 
                message: "유효한 사용자 ID가 필요합니다." 
            });
        }
        
        const user = await db.User.findOne({
            where: { userid: userid },
            attributes: ['userid', 'oauthprovider', 'email', 'nickname', 'profimg', 'status', 'role', 'plan', 'pay']
        });

        if (!user) {
            return res.status(404).json({ 
                message: "사용자를 찾을 수 없습니다." 
            });
        }

        res.status(200).json({
            message: "사용자 조회 성공",
            data: user
        });
    } catch (error) {
        // console.error("사용자 조회 실패:", error);
        res.status(500).json({ 
            message: "서버 오류", 
            error: error.message 
        });
    }
};

// 사용자 생성
const createUser = async (req, res) => {
    try {
        // console.log('createUser 함수 시작');
        // console.log('요청 데이터:', req.body);
        
        const { oauthprovider, oauthid, email, nickname, profimg } = req.body;

        // 필수 필드 검증
        if (!oauthprovider || !oauthid) {
            return res.status(400).json({ 
                message: "OAuth 제공자와 ID는 필수입니다." 
            });
        }

        // 중복 사용자 체크
        const existingUser = await db.User.findOne({
            where: { 
                oauthid: oauthid 
            }
        });

        if (existingUser) {
            return res.status(409).json({ 
                message: "이미 존재하는 사용자입니다.",
                data: {
                    userid: existingUser.userid,
                    email: existingUser.email,
                    nickname: existingUser.nickname
                }
            });
        }
        
        const newUser = await db.User.create({
            oauthprovider,
            oauthid,
            email: email || null,
            nickname: nickname || null,
            profimg: profimg || null,
            status: 1,
            role: 2,
            plan: 1,
            pay: null
        });

        // console.log('사용자 생성 성공:', newUser.userid);

      // 추가: 생성 후 DB 저장 유무 확인
      const verifyUser = await db.User.findOne({
          where: { userid: newUser.userid }
      });
    //   console.log('DB 저장 확인:', verifyUser ? '성공' : '실패');

        res.status(201).json({
            message: "사용자 생성 성공",
            data: {
                userid: newUser.userid,
                oauthprovider: newUser.oauthprovider,
                email: newUser.email,
                nickname: newUser.nickname,
                status: newUser.status,
                role: newUser.role,
                plan: newUser.plan
            }
        });
    } catch (error) {
        // console.error("사용자 생성 실패:", error);
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ 
                message: "이미 존재하는 사용자입니다."
            });
        }
        
        res.status(500).json({ 
            message: "서버 오류", 
            error: error.message 
        });
    }
};

// 사용자 정보 업데이트
const updateUserStatus = async (req, res) => {
    try {
        const { userid } = req.params;
        const { status, role, plan, pay, email, nickname, profimg } = req.body;

        // 사용자 존재 확인
        const user = await db.User.findOne({
            where: { userid: userid }
        });

        if (!user) {
            return res.status(404).json({ 
                message: "사용자를 찾을 수 없습니다." 
            });
        }

        // 업데이트할 필드만 포함
        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (role !== undefined) updateData.role = role;
        if (plan !== undefined) updateData.plan = plan;
        if (pay !== undefined) updateData.pay = pay;
        if (email !== undefined) updateData.email = email;
        if (nickname !== undefined) updateData.nickname = nickname;
        if (profimg !== undefined) updateData.profimg = profimg;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ 
                message: "업데이트할 필드가 없습니다." 
            });
        }

        const [updatedRows] = await db.User.update(
            updateData,
            { where: { userid: userid } }
        );

        if (updatedRows === 0) {
            return res.status(400).json({ 
                message: "업데이트 실패" 
            });
        }

        // 업데이트된 사용자 정보 반환
        const updatedUser = await db.User.findOne({
            where: { userid: userid },
            attributes: ['userid', 'oauthprovider', 'email', 'nickname', 'profimg', 'status', 'role', 'plan', 'pay']
        });

        res.status(200).json({
            message: "사용자 정보 업데이트 성공",
            data: updatedUser
        });
    } catch (error) {
        // console.error("사용자 업데이트 실패:", error);
        res.status(500).json({ 
            message: "서버 오류", 
            error: error.message 
        });
    }
};

// 사용자 경고 처리 (1 -> 2로 변경)
const softDeleteUser = async (req, res) => {
    try {
        const { userid } = req.params;

        // 사용자 존재 확인
        const user = await db.User.findOne({
            where: { userid: userid }
        });

        if (!user) {
            return res.status(404).json({ 
                message: "사용자를 찾을 수 없습니다." 
            });
        }

        // 현재 상태 확인
        if (user.status === 1) {
            // 정상 -> 경고로 변경
            await db.User.update(
                { status: 2 },
                { where: { userid: userid } }
            );

            res.status(200).json({
                message: "사용자가 경고 상태로 변경되었습니다.",
                data: {
                    userid: user.userid,
                    previousStatus: 1,
                    currentStatus: 2
                }
            });
        } else if (user.status === 2) {
            res.status(400).json({
                message: "이미 경고 상태인 사용자입니다."
            });
        } else if (user.status === 3) {
            res.status(400).json({
                message: "이미 삭제된 사용자입니다."
            });
        }
    } catch (error) {
        console.error("사용자 경고 처리 실패:", error);
        res.status(500).json({ 
            message: "서버 오류", 
            error: error.message 
        });
    }
};

// 사용자 삭제 (2 -> 3 또는 1 -> 3으로 변경)
const deleteUser = async (req, res) => {
    try {
        const { userid } = req.params;

        // 사용자 존재 확인
        const user = await db.User.findOne({
            where: { userid: userid }
        });

        if (!user) {
            return res.status(404).json({ 
                message: "사용자를 찾을 수 없습니다." 
            });
        }

        if (user.status === 3) {
            return res.status(400).json({
                message: "이미 삭제된 사용자입니다."
            });
        }

        // 상태를 3(강제삭제)으로 변경
        await db.User.update(
            { status: 3 },
            { where: { userid: userid } }
        );

        res.status(200).json({
            message: "사용자가 삭제되었습니다.",
            data: {
                userid: user.userid,
                previousStatus: user.status,
                currentStatus: 3
            }
        });
    } catch (error) {
        console.error("사용자 삭제 실패:", error);
        res.status(500).json({ 
            message: "서버 오류", 
            error: error.message 
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUserStatus,
    softDeleteUser,
    deleteUser
};