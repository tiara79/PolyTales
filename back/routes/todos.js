// file: back/routes/todos.js

const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todos");
const { getNotesByMonth } = require("../controllers/todos");
//  /todos/month/6 → 6월 전체 메모 조회
router.get("/month/:month", getNotesByMonth);

// http://localhost:3000/todos
router.post("/", todoController.createTodo);
router.get("/", todoController.findAllTodos);
router.get("/:id", todoController.findTodo);
router.put("/:id", todoController.updateTodo);
router.delete("/:id", todoController.deleteTodo);



module.exports = router;