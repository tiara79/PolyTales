const { Sequelize } = require('sequelize');
const config = require('../config/config.js')['development'];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 필요한 모델만 import
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.Story = require('./Story')(sequelize, Sequelize.DataTypes);
db.Note = require('./Note')(sequelize, Sequelize.DataTypes);

// 관계 설정
db.User.hasMany(db.Note, { foreignKey: 'userId' });
db.Note.belongsTo(db.User, { foreignKey: 'userId' });

db.Story.hasMany(db.Note, { foreignKey: 'storyId' });
db.Note.belongsTo(db.Story, { foreignKey: 'storyId' });

module.exports = db;
