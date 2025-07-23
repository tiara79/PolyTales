'use strict';

const fs = require('fs');
const path = require('path');
const sqlite3 = require('better-sqlite3'); 
const process = require('process');
const basename = path.basename(__filename);
const db = {};

const database = new sqlite3(path.join(__dirname, '../database/sample.db'), { verbose: console.log }); // SQLite 데이터베이스 연결

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
  .forEach(file => {
    const model = require(path.join(__dirname, file))(database); // 데이터베이스 연결을 모델에 전달
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
