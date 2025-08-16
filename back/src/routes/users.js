// src/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authRequired, onlyAdmin } = require('../middlewares/auth'); 

// 회원의 상태 변경(1,2,3,4)
router.patch('/:userid/status', authRequired, onlyAdmin, userController.adminSetStatus);

// 강제 탈퇴(= status 3)
router.post('/:userid/force-withdraw', authRequired, onlyAdmin, userController.adminForceWithdraw);

// GET /users - 전체 사용자 조회 
router.get('/', userController.getUsers);

// GET /users/:userid - 특정 사용자 조회
router.get('/:userid', userController.getUserById);

// POST /users - 사용자 생성
router.post('/', userController.createUser);

// PUT /users/:userid - 사용자 정보 업데이트
router.put('/:userid', userController.updateUserStatus);

// PUT /users/:userid/deactivate - 사용자 경고 1->2번으로 변경
router.put('/:userid/deactivate', userController.softDeleteUser);

// DELETE /users/:userid - 사용자 삭제 (status를 3번으로 변경)
router.delete('/:userid', userController.deleteUser);

// 사용자 탈퇴 (status = 4)
router.patch('/:userid/withdraw', authRequired, userController.userWithdraw);


module.exports = router;