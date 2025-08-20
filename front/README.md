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
  # mac 의 경우 packgage.json start 수정 필요
  # "scripts": {
  #   "start": "set PORT=3001 && react-scripts start",
  #   "build": "react-scripts build",
  #   "test": "react-scripts test",
  #   "eject": "react-scripts eject"
  # },
  
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

# 추가 설치
npm install react-toastify # React에서 알림 메시지를 예쁘고 쉽게 띄워주는 라이브러리


# 프론트에서 필요한 서버 관련 코드는:
Rest api 사용
프록시 설정 (vite.config.js 또는 package.json)
API 호출용 axios, fetch 코드


| 요소   설명                                       |
| ------- | -----------------------------------------|
| `div1` | 왼쪽 상단: **처음부터 읽기** 버튼           |
| `div2` | 제목 - Lily’s happy day**                  |
| `div3` | 이미지 및 문장 / 컨트롤 버튼                 |
| `div4` | 문법 박스                                   |
| `div5` | 단어 박스                                   |
| `div6` | **언어 선택 라디오 버튼**                   |
| `div7` | 노트                                        |
| `div8` | 채팅내역                                    |

# npm 캐시 정리
npm cache clean --force

# node_modules와 package-lock.json 삭제
rm -rf node_modules
rm -f package-lock.json

# 다시 설치 시도
npm install

# twilio 가입( 문자 인증 )
https://www.twilio.com/docs/verify?utm_source=chatgpt.com

// 개발환경: http://localhost:3000/img/contents/lilys_happy_day.png
// 배포환경: https://polytales-api.azurewebsites.net/img/contents/lilys_happy_day.png
// .env 환경변수 설정: REACT_APP_API_URL=https://polytales-api.azurewebsites.net
// 환경별 설정 - App Service 정적 파일 서빙 방식

#DB 값 - 경로 설정(//back/src/util/pathFixers.js )
story.storycoverpath = /style/img/… (레거시)
StoryLearn.imagepath = /img/A1/lily/lily_1.png (컨테이너명 포함 + 대문자 A1)
StoryLearn.audiopath = /audio/A1/lily/lily_1_ko.mp3 (컨테이너명 포함 + 대문자 A1)
Blob은 컨테이너명은 URL에서만 붙이고, 경로는 대소문자 그대로 매칭합니다.
-> img/, audio/ 컨테이너명 사용
-> DB에는 컨테이너명 없이 상대경로만(+ a1 소문자 저장) 하거나, 응답 시 변환

cd polytales-be
cd polytales-fe
npm install
npm run build

# PowerShell에서 폴더 이동 방법
cd "C:\Users\user\Documents\Nambu\PolyTales\back"

# PowerShell에서 npm 실행 오류(Execution Policy) 해결 방법
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# 이후 npm install 등 명령 실행 가능
npm install

# 폴더가 없어서 cd polytales-be 에러가 발생할 경우
# 먼저 폴더를 생성하세요.
mkdir -p polytales-be
cd polytales-be

# node_modules와 빌드 캐시를 정리
rm -rf node_modules package-lock.json && npm install
npm run build


# 파일명 대소문자 변경 (윈도우/리눅스/CI 환경 모두 호환)
# 1. 실제 파일 경로와 확장자를 확인하세요. 예시: src/page/BookMark.jsx

# 2. 임시 이름으로 변경
git mv src/page/BookMark.jsx src/page/tempFile.jsx

# 3. 원하는 이름으로 다시 변경 (대소문자 포함)
git mv src/page/tempFile.jsx src/page/Bookmark.jsx

# 4. 변경 사항 커밋 및 푸시
git commit -am "Fix filename case from BookMark to Bookmark"
git push