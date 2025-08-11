require('dotenv').config();

const express = require('express');
const cors = require("cors");
const path = require('path');
const { sequelize } = require('./src/models');


// ──────────────── 라우터 설정 ────────────────
const authRoutes = require('./src/routes/auth');
const userRouter = require('./src/routes/users');
const notesRouter = require("./src/routes/notes");
const storiesRouter = require("./src/routes/story");
const learnRouter = require('./src/routes/learn');
const languageRouter = require('./src/routes/language');
const verificationRouter = require('./src/routes/verification');
// const tutorRouter = require('./src/routes/tutor');

const app = express();

// ──────────────── 서버 설정 ────────────────
// HTTP 헤더 크기 제한 늘리기 및 431 오류 해결
app.use((req, res, next) => {
  // 캐시 제어
  res.setHeader('Cache-Control', 'no-cache');

  // 큰 헤더 처리를 위한 설정
  res.setHeader('Access-Control-Max-Age', '86400');

  // 요청 헤더가 너무 클 경우 처리
  if (req.headers && Object.keys(req.headers).length > 50) {
    console.warn('Large number of headers detected:', Object.keys(req.headers).length);
  }

  next();
});


// ──────────────── 미들웨어 ────────────────
app.use(cors({
  origin: ['http://localhost:3001'],
  credentials: true,
  exposedHeaders: ['Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204
}));

// Body parsers
app.use(express.json({ limit: '2mb' })); 
app.use(express.urlencoded({ extended: true }));

// ──────────────── 정적 파일 서빙 ────────────────
app.use('/audio', express.static(path.join(__dirname, '../front/public/audio')));
app.use('/img', express.static(path.join(__dirname, '../front/public/img')));
app.use('/img/contents', express.static(path.join(__dirname, '../front/src/style/img/contents')));
app.use('/caption', express.static(path.join(__dirname, '../front/public/caption')));

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// ──────────────── 라우터 연결 ────────────────
app.use('/auth', authRoutes);
app.use('/users', userRouter);
app.use("/notes", notesRouter);
app.use("/stories", storiesRouter);
app.use('/learn', learnRouter);
app.use('/language', languageRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/verification', verificationRouter);

// ──────────────── 에러 처리 ────────────────
app.use((req, res) => {
  res.status(404).json({
    status: "Fail",
    message: "요청한 리소스를 찾을 수 없습니다.",
  });
});

app.use((err, req, res, next) => {
  console.error(` Server Error: ${err.message}`);
  res.status(500).json({
    status: "Error",
    message: `서버 오류: ${err.message}`,
  });
});

// ──────────────── 서버 시작 ────────────────
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // await models.sequelize.sync({ force: true  }); // 데이터 삭제됨
    // 테이블이 없으면 생성, 있으면 그대로 유지 → 데이터 보존
    await sequelize.authenticate();
    console.log(`Connected DB: ${sequelize.config.database}`);

    app.listen(PORT, () => {
      console.log(` 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    });
  } catch (error) {
    console.error(" 서버 시작 실패:", error);
    process.exit(1);
  }
}

startServer();
