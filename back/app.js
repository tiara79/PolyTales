require('dotenv').config();
const express = require('express');
const cors = require("cors");
const path = require('path');
const { sequelize } = require('./src/models');

// 라우터
const authRoutes = require('./src/routes/auth');
const userRouter = require('./src/routes/users');
const notesRouter = require("./src/routes/notes");
const storiesRouter = require("./src/routes/story");
const learnRouter = require('./src/routes/learn');
const languageRouter = require('./src/routes/language');
const verificationRouter = require('./src/routes/verification');
// const uploadRouter = require('./src/routes/upload'); // 파일이 없으면 주석 처리

const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:3001'],
  credentials: true,
  exposedHeaders: ['Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// 정적 파일 (프론트 public 경로 기준)
app.use('/audio', express.static(path.join(__dirname, '../front/public/audio')));
app.use('/img', express.static(path.join(__dirname, '../front/public/img')));
app.use('/img/contents', express.static(path.join(__dirname, '../front/public/img/contents')));
app.use('/img/uploads', express.static(path.join(__dirname, '../front/public/img/uploads')));
app.use('/caption', express.static(path.join(__dirname, '../front/public/caption')));

// 라우터 연결
app.use('/auth', authRoutes);
app.use('/users', userRouter);
app.use("/notes", notesRouter);
app.use("/stories", storiesRouter);
app.use('/learn', learnRouter);
app.use('/language', languageRouter);
// app.use('/uploads', uploadRouter); // 프로필 업로드
app.use('/verification', verificationRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ status: "Fail", message: "요청한 리소스를 찾을 수 없습니다." });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
(async () => {
  try {
    await sequelize.authenticate();
    console.log(`Connected DB: ${sequelize.config.database}`);
    app.listen(PORT, () => console.log(` 서버가 http://localhost:${PORT} 에서 실행 중입니다.`));
  } catch (err) {
    console.error(" 서버 시작 실패:", err);
    process.exit(1);
  }
})();
