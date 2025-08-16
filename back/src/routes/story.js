const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const storyController = require("../controllers/storyController");
const { authenticate } = require("../middlewares/auth");

// 토큰이 있으면 req.user를 채우고, 없어도 통과
const softAuth = (req, _res, next) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return next();
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch (_) {}
  next();
};

// 기존 라우트들 ...
router.get("/", storyController.getStories);
router.get("/levels", storyController.getAllLevels);

//  여기에만 softAuth 붙이기
router.get("/level/:level", softAuth, storyController.getStoryByLevel);

router.get("/:level/detail/:id", storyController.getStoryById);

router.post("/", authenticate, storyController.createStory);
router.put("/:level/detail/:id", authenticate, storyController.updateStory);
router.delete("/:level/detail/:id", authenticate, storyController.deleteStory);

module.exports = router;
