require('dotenv').config();

const express = require('express');
const cors = require("cors");
const { sequelize } = require('./src/models');

const authRoutes = require('./src/routes/auth');
const notesRouter = require("./src/routes/notes");
const storiesRouter = require("./src/routes/story");

const app = express();

// ──────────────── 미들웨어 ────────────────
app.use(cors({
  origin: ['http://localhost:3001'],
  credentials: true,
  exposedHeaders: ['Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ──────────────── 라우터 ────────────────
app.use('/auth', authRoutes);
app.use("/notes", notesRouter);
app.use("/stories", storiesRouter);

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
    await sequelize.sync();
    console.log("DB connected successfully");

    app.listen(PORT, () => {
      console.log(` 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    });
  } catch (error) {
    console.error(" 서버 시작 실패:", error);
    process.exit(1);
  }
}

startServer();
