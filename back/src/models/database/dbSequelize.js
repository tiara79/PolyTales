const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true }); // 변경 사항 반영
    console.log('All tables have been synchronized successfully.');
  } catch (err) {
    console.error('DB synchronization failure:', err);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
