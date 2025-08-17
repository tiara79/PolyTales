// front/src/routes/story.js
// 스토리 관련 경로 필터 라우터
const express = require("express");
const router = express.Router();
const { Story } = require("../models");
const { toImgUrl } = require("../util/pathFixers");

router.get("/", async (req, res) => {
  try {
    const rows = await Story.findAll();
    const out = rows.map((r) => {
      const o = r.toJSON();
      o.storycoverpath = toImgUrl(o.storycoverpath);
      o.thumbnail = toImgUrl(o.thumbnail);
      return o;
    });

    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
});

module.exports = router;
