// src/config/config.js
 // 상단, .env 파일이 없거나 문제가 있어도 에러 메시지가 출력되지 않습니다.
// require('dotenv').config({ silent: true });
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_DATABASE || "polytale",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || "postgres"
  },
  test: {
    username: process.env.DB_USERNAME || "postgres", // 로컬 PostgreSQL 사용자명
    password: process.env.DB_PASSWORD || null, // 로컬 PostgreSQL 비밀번호
    database: process.env.DB_DATABASE || "database_test", // 테스트 DB 이름
    host: process.env.DB_HOST || "127.0.0.1", // 로컬 호스트
    port: process.env.DB_PORT || 5432, // PostgreSQL 기본 포트
    dialect: "postgres" // PostgreSQL로 변경
  },
  production: {
    username: "root", // 실제 Azure에서 사용하는 DB 사용자명
    password: null, // 실제 DB 비밀번호
    database: "database_production", // 실제 프로덕션 DB 이름
    host: "127.0.0.1", // Azure에서 제공한 PostgreSQL 호스트
    dialect: "postgres" // Azure PostgreSQL 사용 시 mysql에서 postgres로 변경
  }
};
