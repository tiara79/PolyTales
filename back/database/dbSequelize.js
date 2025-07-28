const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true }); // 변경 사항 반영
    console.log('✅ 모든 테이블이 성공적으로 동기화되었습니다.');
  } catch (err) {
    console.error('❌ DB 동기화 실패:', err);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
