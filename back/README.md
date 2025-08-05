# 루트 폴더에서 의존성 설치:

npm install
npm outdated # 낮은 버전 찾음

# back 폴더 설치

npm init -y # 프로젝트 생성
npm i express # 익스프레스 웹서버
npm i nodemon # 노드용 데몬 설치
npm i sqlite3 # sqlite3 디비 용
npm i multer # 첨부파일용
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

npx sequelize-cli init # 시퀄라이즈 초기화
npm i sequelize-cli # 시퀄라이즈 ORM 커맨드라인 인터페이스
npm i sequelize # 시퀄라이즈 ORM

# 실행 : npm run dev

cd front npm run start, cd back npx nodemon app.js , 루트 실행 npm run dev
// 루트 폴더 설치 npm install concurrently --save-dev

"devDependencies": {
"concurrently": "^9.1.2",
"nodemon": "^3.1.10"
}
/c/Users/user/Documents/Nambu/FullStackWeb/React/BookLife$ npm install concurrently --save-dev

# 간편 sns 토큰 헤더 증량
cd /Users/agelin/FullStackWeb/React/PolyTales\(BE\)/back && cat > nodemon.json << 'EOF'
{
  "exec": "node --max-http-header-size=32768 app.js",
  "watch": ["src", "app.js"],
  "ext": "js,json",
  "ignore": ["node_modules", "logs", "public/uploads"]
}
EOF
파일 작성후, npx nodemon 또는 npm run server 로 백서버 실행