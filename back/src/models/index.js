// src/models/index.js
const { Sequelize } = require('sequelize');
const config = require('../config/config.js')['development'];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const db = {};
db.Sequelize = Sequelize; // Sequelize 클래스
db.sequelize = sequelize; // Sequelize 연결 인스턴스 ← 반드시 있어야 app.js에서 sync 가능

// 필요한 모델만 import
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.Story = require('./story')(sequelize, Sequelize.DataTypes);
db.Note = require('./note')(sequelize, Sequelize.DataTypes);
db.learn = require('./learn')(sequelize, Sequelize.DataTypes);

// 관계 설정
db.User.hasMany(db.Note, { foreignKey: 'userid' })
db.Note.belongsTo(db.User, { foreignKey: 'userid' });

db.Story.hasMany(db.Note, { foreignKey: 'storyid' });
db.Note.belongsTo(db.Story, { foreignKey: 'storyid' });

module.exports = db;
