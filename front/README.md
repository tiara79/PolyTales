
# 프로젝트

React + Express + SQLite 기반의  웹입니다.  

# 폴더 구조
```
- front/     # React 프론트엔드
- back/      # Express 백엔드 API
```

# 설치 및 실행

```bash
# 루트 디렉토리에서 의존성 설치
npm install

# 프론트 실행 (http://localhost:3001)
npm start

# 백엔드 실행 (http://localhost:3000)
npx nodemon app.js
```

# 사용 기술
- 프론트: React, axios, react-router-dom
- 백엔드: Node.js, Express, better-sqlite3

# git 초기 연결
git init
git add .
git commit -m "Initial commit for PolyTales"
git remote add origin https://github.com/tiara79/PolyTales

git branch -M main
git push -u origin main

# git 업데이트
git add .
git commit -m "Added login UI and updated README" -- 커밋 메세지
git push

# git 공유
git clone https://github.com/tiara79/PolyTales.git

# front 폴더 설치
npm install react-scripts # init 후 설치

npx create-react-app front #React 프로젝트 초기화
npm install axios react-router-dom # React 관련 필수 패키지
npm install react-dropzone # React 개발 환경에서 파일 업로드
npm install redux react-redux # redux: 상태 관리 라이브러리, react-redux: React와 Redux를 연결해주는 라이브러리
.env 파일 # API 서버 URL 등 환경 변수를 관리
npm install -g yarn # Facebook에서 개발, npm보다 더 빠르고, 캐시 관리가 더 효율적
npm i axios # 설치 후, 간단하게 HTTP 요청
fetch/axios # 프론트에서 api 호출할때 사용 ,js 라이브러리 
npm install react-kakao-maps-sdk

# 프론트에서 필요한 서버 관련 코드는:
Rest api 사용
프록시 설정 (vite.config.js 또는 package.json)
API 호출용 axios, fetch 코드