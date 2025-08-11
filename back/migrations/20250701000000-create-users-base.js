'use strict';

/** 최초 1회: 새 DB에서 users 테이블이 없다면 만들어줍니다. */
module.exports = {
  async up(qi, S) {
    // Sequelize createTable 은 IF NOT EXISTS 가 없어 raw SQL 사용
    await qi.sequelize.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        userid        SERIAL PRIMARY KEY,
        oauthprovider TEXT,
        oauthid       TEXT,
        email         TEXT,
        nickname      TEXT,
        profimg       TEXT,
        status        INTEGER,
        role          INTEGER,
        plan          INTEGER,
        pay           INTEGER,
        createdAt     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updatedAt     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    // (선택) 과거에 쓰던 유니크 인덱스가 필요하면 아래 주석 해제
    // await qi.sequelize.query(`
    //   CREATE UNIQUE INDEX IF NOT EXISTS users_oauthprovider_oauthid_unique
    //   ON public.users (oauthprovider, oauthid);
    // `);
  },

  async down(qi, S) {
    // 운영 DB에서 테이블을 지우는 건 위험하니 down은 비워두거나 주석 처리 권장
    // await qi.dropTable('users');
  }
};
