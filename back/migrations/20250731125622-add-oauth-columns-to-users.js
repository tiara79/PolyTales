// migrations/20250731125622-add-oauth-columns-to-users.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      const desc = await queryInterface.describeTable('users');

      // 1) 과거 카멜 컬럼이 있으면 소문자로 리네임
      if (desc.oauthProvider && !desc.oauthprovider) {
        await queryInterface.renameColumn('users', 'oauthProvider', 'oauthprovider', { transaction: t });
      }
      if (desc.oauthId && !desc.oauthid) {
        await queryInterface.renameColumn('users', 'oauthId', 'oauthid', { transaction: t });
      }

      // 2) 소문자 컬럼이 없으면 추가
      const d2 = await queryInterface.describeTable('users');
      if (!d2.oauthprovider) {
        await queryInterface.addColumn('users', 'oauthprovider', {
          type: Sequelize.TEXT,
          allowNull: true, // 기존 데이터 고려 (운영에서는 제약으로 NOT NULL)
        }, { transaction: t });
      }
      if (!d2.oauthid) {
        await queryInterface.addColumn('users', 'oauthid', {
          type: Sequelize.TEXT,
          allowNull: true,
        }, { transaction: t });
      }

      // 3) (선택) 복합 유니크 제약 보강
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'users_oauthprovider_oauthid_unique'
              AND conrelid = 'public.users'::regclass
          ) THEN
            ALTER TABLE public.users
              ADD CONSTRAINT users_oauthprovider_oauthid_unique
              UNIQUE (oauthprovider, oauthid);
          END IF;
        END $$;
      `, { transaction: t });

      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  async down(queryInterface) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('users', 'oauthid', { transaction: t }).catch(() => {});
      await queryInterface.removeColumn('users', 'oauthprovider', { transaction: t }).catch(() => {});
      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }
};
