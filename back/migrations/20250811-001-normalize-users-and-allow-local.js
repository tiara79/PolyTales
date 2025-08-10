'use strict';

module.exports = {
  async up(qi, S) {
    const t = await qi.sequelize.transaction();
    try {
      const desc = await qi.describeTable('users');

      // 대문자 컬럼이 남아있다면 제거
      if (desc.oauthProvider) await qi.removeColumn('users', 'oauthProvider', { transaction: t });
      if (desc.oauthId)       await qi.removeColumn('users', 'oauthId',       { transaction: t });

      // provider 체크 제약: local 포함
      await qi.sequelize.query(
        `ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_oauthprovider_check;`,
        { transaction: t }
      );
      await qi.sequelize.query(
        `ALTER TABLE public.users
           ADD CONSTRAINT users_oauthprovider_check
           CHECK (oauthprovider IN ('naver','kakao','google','local'));`,
        { transaction: t }
      );

      // 복합 유니크 보장
      await qi.sequelize.query(
        `DO $$
         BEGIN
           IF NOT EXISTS (
             SELECT 1 FROM pg_indexes
             WHERE schemaname='public' AND indexname='users_oauthprovider_oauthid_unique'
           ) THEN
             CREATE UNIQUE INDEX users_oauthprovider_oauthid_unique
             ON public.users (oauthprovider, oauthid);
           END IF;
         END $$;`,
        { transaction: t }
      );

      await t.commit();
    } catch (e) { await t.rollback(); throw e; }
  },

  async down(qi) {
    const t = await qi.sequelize.transaction();
    try {
      // 제약을 소셜 3종으로 되돌림
      await qi.sequelize.query(
        `ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_oauthprovider_check;`,
        { transaction: t }
      );
      await qi.sequelize.query(
        `ALTER TABLE public.users
           ADD CONSTRAINT users_oauthprovider_check
           CHECK (oauthprovider IN ('naver','kakao','google'));`,
        { transaction: t }
      );

      // 유니크 인덱스는 유지 (데이터 보호 차원). 필요시 아래 주석 해제
      // await qi.sequelize.query(`DROP INDEX IF EXISTS users_oauthprovider_oauthid_unique;`, { transaction: t });

      await t.commit();
    } catch (e) { await t.rollback(); throw e; }
  }
};
