// back/src/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

const required  = auth.required || auth.authRequired || auth.authenticate || ((req, _res, next) => next());
const adminOnly = auth.adminOnly || ((req, _res, next) => next());

// 목록 / 생성
router.get('/', userController.getUsers);
router.post('/', userController.createUser);

// 관리자 전용
router.patch('/:userid(\\d+)/status', required, adminOnly, userController.adminSetStatus);
router.post('/:userid(\\d+)/force-withdraw', required, adminOnly, userController.adminForceWithdraw);

// 개별 사용자 (숫자 id만)
router.get('/:userid(\\d+)', userController.getUserById);
router.put('/:userid(\\d+)', userController.updateUserStatus);
router.put('/:userid(\\d+)/deactivate', userController.softDeleteUser);
router.patch('/:userid(\\d+)/withdraw', required, userController.userWithdraw);
router.delete('/:userid(\\d+)', userController.deleteUser);

module.exports = router;
