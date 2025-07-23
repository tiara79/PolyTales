// back/database/initDatabase.js
const path = require('path');
const Database = require('better-sqlite3');

// DB 경로를 back/database/sample.db로 지정
const db = new Database(path.join(__dirname, '../database/sample.db')); 

// 테이블 생성
function initializeDatabase() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY AUTOINCREMENT,
      userName TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT DEFAULT 'member',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS todos (
      todoId INTEGER PRIMARY KEY AUTOINCREMENT,
      task VARCHAR(255) NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      dDay DATE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      priority INTEGER DEFAULT 1,
      userId INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
    );
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS posts (
      postId INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      fileName TEXT,
      filePath TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME,
      userId INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
    );
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS comments (
      commentId INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME,
      isDeleted INTEGER DEFAULT 0,
      parentId INTEGER DEFAULT NULL,
      postId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      FOREIGN KEY (parentId) REFERENCES comments(commentId) ON DELETE CASCADE,
      FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
    );
  `).run();
}

module.exports = {initializeDatabase, db};