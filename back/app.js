// back/src/middlewares/normalizeMedia.js
// 간결 전역 미들웨어: 응답 객체 내 image/audio 경로를 pathFixers로 정규화
// back/app.js
// -----------------------------------------------------------------------------
// 서버 부트스트랩
// - 정적 폴더(/img, /audio, /caption) 서빙
// - CORS 허용(프론트 3001)
// - 응답 경로 정규화 미들웨어(normalizeMedia) 전역 적용
// - 라우터 연결(프로젝트에 이미 있는 라우터 사용)
// -----------------------------------------------------------------------------
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./src/models');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const notesRoutes = require('./src/routes/notes');
const storyRoutes = require('./src/routes/story');
const learnRoutes = require('./src/routes/learn');
const languageRoutes = require('./src/routes/language');
const verificationRoutes = require('./src/routes/verification');
const tutorRoutes = require('./src/routes/tutor');

const app = express();

app.use(cors({
  // origin: ['https://polytales.azurewebsites.net'],
  origin: true,
  credentials: true,
  exposedHeaders: ['Authorization'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// 정적 폴더: front/public 기준
app.use('/audio', express.static(path.join(__dirname, '../front/public/audio')));
app.use('/img', express.static(path.join(__dirname, '../front/public/img')));
app.use('/caption', express.static(path.join(__dirname, '../front/public/caption')));

// 응답 경로 정규화(이미지/오디오) — 전역 미들웨어
app.use(require('./src/middlewares/normalizeMedia'));

// 라우터 - /api prefix 추가
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/learn', learnRoutes);
app.use('/api/language', languageRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/tutor', tutorRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'PolyTales Backend API', version: '1.0.0' });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ status: 'Fail', message: '요청한 리소스를 찾을 수 없습니다.' });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
(async () => {
  try {
    await sequelize.authenticate();
    console.log(`Connected DB: ${sequelize.config.database}`);
    app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
  } catch (err) {
    console.error('서버 시작 실패:', err);
    process.exit(1);
  }
})();
