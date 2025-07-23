// File: back/routes/auth.js
//백엔드에서 회원가입과 로그인 요청을 처리하는 라우터

const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// http://localhost:3000/auth/register
router.post("/register", authController.register);

// http://localhost:3000/auth/login
router.post('/login', authController.login);

module.exports = router;