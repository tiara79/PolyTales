// src/controllers/storyController.js

const db = require("../models");

const { getCover } = require("../util/coverResolver");

const OPEN_DETAIL_IDS = [1, 10, 15, 17, 19, 29, 30, 38];

function decorate(v, page) {
  const raw = v || {};
  const { thumbnail_url, cover_candidates } = getCover(raw, page);
  return { ...raw, thumbnail_url, cover_candidates };
}

function roleFromReq(req) {
  if (req?.user?.role === 1) return 1;
  if (req?.user) return 2;
  return 0;
}

const getStories = async (req, res) => {
  try {
    const { level, topic } = req.query;
    const where = {};
    if (level) where.langlevel = String(level).toUpperCase();
    if (topic) where.topic = topic;

    const rows = await db.Story.findAll({ where, order: [["storyid", "ASC"]] });
    const data = rows.map((r) => decorate(r.get({ plain: true }), "home"));
    res.status(200).json({ message: "Full Story View Success", count: data.length, data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getAllLevels = async (_req, res) => {
  try {
    const levels = await db.Story.findAll({
      attributes: [[db.Sequelize.fn("DISTINCT", db.Sequelize.col("langlevel")), "langlevel"]],
      order: [["langlevel", "ASC"]],
      raw: true,
    });
    const data = levels.map((x) => x.langlevel);
    res.status(200).json({ message: "Level list retrieved successfully", count: data.length, data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getStoryByLevel = async (req, res) => {
  try {
    const level = String(req.params.level || "").toUpperCase();

    const rows = await db.Story.findAll({
      where: { langlevel: level },
      order: [
        [db.sequelize.literal(`CASE WHEN "storyid" IN (${OPEN_DETAIL_IDS.join(",")}) THEN 0 ELSE 1 END`), "ASC"],
        ["storyid", "ASC"],
      ],
    });

    if (rows.length === 0) {
      return res.status(404).json({ message: `${level} Level stories not found.`, count: 0, data: [] });
    }

    const role = roleFromReq(req);
    const data = rows.map((r) => {
      const v = decorate(r.get({ plain: true }), "home");
      const is_open_id = OPEN_DETAIL_IDS.includes(v.storyid);
      let can_access = false;
      if (role === 1) can_access = true;
      else if (role === 2) can_access = is_open_id;
      else can_access = v.langlevel === "A1" && v.storyid === 1;
      return { ...v, is_open_id, can_access };
    });

    res.status(200).json({ message: `${level} Level stories retrieved successfully`, count: data.length, data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getStoryById = async (req, res) => {
  try {
    const level = String(req.params.level || "").toUpperCase();
    const { id } = req.params;

    const row = await db.Story.findOne({ where: { storyid: id, langlevel: level } });
    if (!row) return res.status(404).json({ message: `${level} Level story not found.` });

    const data = decorate(row.get({ plain: true }), "detail");
    res.status(200).json({ message: "Story detail retrieval successful", data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const createStory = async (req, res) => {
  try {
    const { storytitle, storycoverpath, thumbnail, movie, description, langlevel, langlevelko, nation, topic } = req.body;
    if (!storytitle || !langlevel) return res.status(400).json({ message: "Title and language level are required." });

    const row = await db.Story.create({
      storytitle,
      storycoverpath: storycoverpath || null,
      thumbnail: thumbnail || null,
      movie: movie || null,
      description: description || null,
      langlevel: String(langlevel).toUpperCase(),
      langlevelko: langlevelko || null,
      nation: nation || null,
      topic: topic || null,
    });

    res.status(201).json({
      message: "Story creation successful",
      data: { storyid: row.storyid, storytitle: row.storytitle, langlevel: row.langlevel, topic: row.topic },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const updateStory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.Story.findOne({ where: { storyid: id } });
    if (!existing) return res.status(404).json({ message: `The story ID ${id} was not found.` });

    if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: "No data provided for update." });

    const payload = req.body.langlevel ? { ...req.body, langlevel: String(req.body.langlevel).toUpperCase() } : req.body;

    const [cnt] = await db.Story.update(payload, { where: { storyid: id } });
    if (cnt === 0) return res.status(400).json({ message: "Failed to update story." });

    const updated = await db.Story.findOne({ where: { storyid: id } });
    res.status(200).json({ message: "Successful story modification", data: decorate(updated.get({ plain: true }), "detail") });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const deleteStory = async (req, res) => {
  try {
    const level = String(req.params.level || "").toUpperCase();
    const { id } = req.params;

    const existing = await db.Story.findOne({ where: { storyid: id, langlevel: level } });
    if (!existing) return res.status(404).json({ message: `The story ID ${id} at level ${level} was not found.` });

    const cnt = await db.Story.destroy({ where: { storyid: id, langlevel: level } });
    if (cnt === 0) return res.status(400).json({ message: "Failed to delete story." });

    res.status(200).json({
      message: "Successful story deletion",
      data: { deletedStoryId: id, deletedLevel: level, deletedTitle: existing.storytitle },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  getStories,
  getAllLevels,
  getStoryByLevel,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
};
