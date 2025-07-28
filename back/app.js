// back/app.js 또는 서버의 진입점
require('dotenv').config(); // .env 파일 로드

const express = require('express');
const cors = require("cors");
const path = require("path");
const db = require('./models');

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const authRouter = require("./routes/auth");
const postRouter = require("./routes/postRouter");

const noteRouter = require('./routes/note');
app.use('/notes', noteRouter);



const app = express();
const uploadDir = `public/uploads`;

// 미들웨어 설정 (반드시 express.json()이나 라우터보다 위에 위치해야 합니다.)
app.use(cors({
  origin: 'http://localhost:3001',           // 프론트엔드 주소
  credentials: true,                         // 인증 정보 포함 허용
  exposedHeaders: ['Authorization']          // 응답 헤더에서 Authorization 허용
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/posts", postRouter);

app.use(express.json());

// 노트 라우터 등록
const noteRouter = require('./routes/note');
app.use('/notes', noteRouter);

// DB 연결
db.sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });
});

// Swagger 설정
const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 파일 다운로드 경로 설정
app.use(`/downloads`, express.static(path.join(__dirname, uploadDir)));

// ----------------------- [서버 시작] -----------------------
const PORT = process.env.PORT || 3000; // 포트 설정
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중 입니다.`);
});

// 404 에러 처리
app.use((req, res) => {
  res.status(404).json({
    status: "Fail",
    message: "요청한 리소스를 찾을 수 없습니다.",
  });
});

// 500 에러 처리
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "Error",
    message: `서버 오류: ${err.stack}`,
  });
});

const initializeDatabase = require('./database/initDatabase');