'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env]; // ✅ 경로 조정
const db = {};

// const database = new sqlite3(path.join(__dirname, '../database/sample.db'), { verbose: console.log }); // SQLite 데이터베이스 연결

// sequelize 객체를 생성
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// 모델 파일 동적으로 로드
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  // .forEach(file => {
  //   const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
  //   db[model.name] = model;
  // });
.filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    console.log(`Loading model file: ${file}`);
    try {
      const modelFactory = require(path.join(__dirname, file));
      console.log(`Model factory type: ${typeof modelFactory}`);
      if (typeof modelFactory === 'function') {
        const model = modelFactory(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
        console.log(`Successfully loaded model: ${model.name}`);
      } else {
        console.error(`Model ${file} does not export a function`);
      }
    } catch (error) {
      console.error(`Error loading model ${file}:`, error);
    }
  });

  
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;