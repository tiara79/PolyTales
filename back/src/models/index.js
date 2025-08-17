// back/src/models/index.js
const { Sequelize, DataTypes } = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config.js")[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// 실제 파일명이 소문자라고 가정합니다.
const User     = require("./user")(sequelize, DataTypes);
const Story    = require("./story")(sequelize, DataTypes);
const Note     = require("./note")(sequelize, DataTypes);
const Language = require("./language")(sequelize, DataTypes);
const Learn    = require("./learn")(sequelize, DataTypes);

const db = {
  Sequelize,
  sequelize,
  // 대문자 키(컨트롤러 호환)
  User,
  Story,
  Note,
  Language,
  Learn,
  // 소문자 별칭(안전장치)
  user: User,
  story: Story,
  note: Note,
  language: Language,
  learn: Learn,
};

// 연관관계 (모든 FK 소문자 유지)
db.User.hasMany(db.Note,   { foreignKey: "userid" });
db.Note.belongsTo(db.User, { foreignKey: "userid" });

db.Story.hasMany(db.Note,   { foreignKey: "storyid" });
db.Note.belongsTo(db.Story, { foreignKey: "storyid" });

db.Story.hasMany(db.Language,   { foreignKey: "storyid" });
db.Language.belongsTo(db.Story, { foreignKey: "storyid" });

module.exports = db;
