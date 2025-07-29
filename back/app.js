// back/app.js 또는 서버의 진입점
require('dotenv').config(); // .env 파일 로드

const express = require('express');
const cors = require("cors");
const path = require("path");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const { sequelize, Story, Language } = require('./src/models');
const authRouter = require("./src/routes/auth");           // 인증 관련 라우터
const notesRouter = require("./src/routes/notes");         // 노트 라우터
const storiesRouter = require("./src/routes/stories");     // 컨텐츠 라우터
const progressRouter = require("./src/routes/progress");   // 진행 상황 라우터 추가
const usersRouter = require("./src/routes/users");         // 사용자 라우터 추가
const languagesRouter = require("./src/routes/languages"); // 언어 라우터 추가

const models = require("./src/models");
const { logger, logging } = require("./src/middlewares/logger");

const app = express();
const uploadDir = `public/uploads`;
app.use(logging); // 로깅 미들웨어
// 미들웨어 설정 (반드시 express.json()이나 라우터보다 위에 위치해야 합니다.)
app.use(cors({
  origin: ['http://localhost:3001'],
  credentials: true,
  exposedHeaders: ['Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use("/auth", authRouter); // 인증 관련 라우터
app.use("/notes", notesRouter);  // 노트 라우터 추가
app.use("/progress", progressRouter); // 진행 상황 라우터 추가
app.use("/stories", storiesRouter); // 스토리 라우터 추가
app.use("/users", usersRouter); // 사용자 라우터 추가
app.use("/languages", languagesRouter); // 언어 라우터 추가

// Swagger 설정
const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 파일 다운로드 경로 설정
app.use(`/downloads`, express.static(path.join(__dirname, uploadDir)));

// 404 에러 처리
app.use((req, res) => {
  res.status(404).json({
    status: "Fail",
    message: "요청한 리소스를 찾을 수 없습니다.",
  });
});

// 500 에러 처리
app.use((err, req, res, next) => {
  logger.error(`Server Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    status: "Error",
    message: `서버 오류: ${err.message}`,
  });
});

// ----------------------- [서버 시작] -----------------------
const PORT = process.env.PORT || 3000; // 포트 설정

async function startServer() {
  try {
    // 1. 먼저 DB 연결 및 동기화
    await models.sequelize.sync({ force: true });
    console.log("✅ DB connected successfully");

    // 2. DB 연결 성공 후 서버 시작
    app.listen(PORT, () => {
      logger.info(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
      console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
      // console.log(`📚 API 문서: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ 서버 시작 실패:", error);
    logger.error("Server startup failed", { error: error.message });
    process.exit(1); // ✅ 명시적 종료 코드 : 실패시 완전 종료
  }
}

startServer();
// const initializeDatabase = require('./src/database/initDatabase');