// src/config.js
require('dotenv').config({ debug: false });

function base() {
  const cfg = {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'polytales',
    host:     process.env.DB_HOST || '127.0.0.1',
    port:     Number(process.env.DB_PORT || 5432),
    dialect:  process.env.DB_DIALECT || 'postgres',
    logging:  false,
  };

  // Azure 접속 시 SSL 필수 → .env에서 DB_SSL=require로 지정
  if ((process.env.DB_SSL || '').toLowerCase() === 'require') {
    cfg.dialectOptions = { ssl: { require: true, /* 개발 중엔 필요 시 rejectUnauthorized:false */ } };
  }
  return cfg;
}

module.exports = {
  development: base(), // 로컬/azure 둘 다 env로 제어
  test:        base(),
  production:  base(), // 배포 때도 동일하게 env로 제어
};
