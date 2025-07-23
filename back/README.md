# 루트 폴더에서 의존성 설치:
npm install
npm outdated # 낮은 버전 찾음

# back 폴더 설치
npm init -y # 프로젝트 생성
npm i express  # 익스프레스 웹서버
npm i nodemon  # 노드용 데몬 설치
npm i sqlite3 # sqlite3 디비 용
npm i multer  # 첨부파일용
npm i bcryptjs # 패스워드 암호화
npm i jsonwebtoken # jwt 토큰생성
npm i joi # 유효성 검증
npm i winston # 로깅
npm install sqlite3 # MySQL 데이터베이스와 연결
npm i swagger-ui-express 
npm i yamljs 
npm install dotenv #jwt 토큰 용
npm install cors #클라이언트에서 오는 요청에 대해 허용

# 참고
npx sequelize-cli init  # 시퀄라이즈 초기화
npm i sequelize-cli  # 시퀄라이즈 ORM 커맨드라인 인터페이스
npm i sequelize   # 시퀄라이즈 ORM

# 실행 
cd front npm run start, cd back npx nodemon app.js , 루트 실행 npm run dev
// 루트 폴더 설치 npm install concurrently --save-dev

  "devDependencies": {
    "concurrently": "^9.1.2",
    "nodemon": "^3.1.10"
  },
/c/Users/user/Documents/Nambu/FullStackWeb/React/BookLife$  npm install concurrently --save-dev

# 생성 테이블 목록
CREATE TABLE User (
userId INTEGER PRIMARY KEY AUTOINCREMENT,
oauthProvider IN (naver,kakao,google),
email TEXT,
nickName TEXT,
profile TEXT,
UNIQUE(oauthProvider, oauthId)
);

CREATE TABLE Story (
storyId INTEGER PRIMARY KEY AUTOINCREMENT,
storyTitle TEXT NOT NULL,
storyCoverPath TEXT,
thumbnail TEXT ,
movie TEXT,
description TEXT,
langLevel TEXT NOT NULL CHECK (
langLevel IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
langLevelKo IN ('초급','초중급','중급','중고급','고급','최고급'),
nation TEXT NOT NULL CHECK (nation IN ('fr', 'ja', 'es', 'en', 'de', 'ko')),
topic TEXT NOT NULL);

CREATE TABLE Language (
vocaId INTEGER PRIMARY KEY AUTOINCREMENT,
word TEXT,
mean TEXT,
partSpeech TEXT,
vocaSentence TEXT,
nation TEXT CHECK (
nation IN ('ko', 'ja', 'en', 'de', 'es', 'fr')),
storyId INTEGER, FOREIGN KEY (storyId) REFERENCES Story(storyId));

CREATE TABLE Note (
noteId INTEGER PRIMARY KEY AUTOINCREMENT,   
userId INTEGER,                             
storyId INTEGER,                         
title TEXT,                             
content TEXT,                          
createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (userId) REFERENCES User(userId),
FOREIGN KEY (storyId) REFERENCES Story(storyId)
);

CREATE TABLE Progress (
progressId INTEGER PRIMARY KEY AUTOINCREMENT,
userId INTEGER,
storyId INTEGER,
currentPage INTEGER,
isFinished BOOLEAN,
updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (userId) REFERENCES User(userId),
FOREIGN KEY (storyId) REFERENCES Story(storyId)
);

CREATE TABLE  Tutor(
chatId INTEGER PRIMARY KEY AUTOINCREMENT,
userId INTEGER,
storyId INTEGER,
message TEXT,
createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (userId) REFERENCES User(userId),
FOREIGN KEY (storyId) REFERENCES Story(storyId)
);