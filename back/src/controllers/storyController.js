// src/controllers/storyController.js 
const db = require("../models");

const getStories = async (req, res) => {
    try {
        console.log(' getStories 함수 시작');
        
        const { level, topic } = req.query;
        let whereCondition = {};
        if (level) whereCondition.langlevel = level;      
        if (topic) whereCondition.topic = topic;
        
        console.log(" whereCondition:", whereCondition);
        
        const stories = await db.Story.findAll({
            where: whereCondition,
            order: [['storyid', 'ASC']]                    
        });

        console.log(' 조회된 스토리 개수:', stories.length);

        res.status(200).json({
            message: "ok",
            count: stories.length,
            data: stories,
        });
    } catch (error) {
        console.error(" 스토리 목록 조회 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
};

const getStoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const story = await db.Story.findByPk(id);

        if (!story) {
            return res.status(404).json({ message: "스토리를 찾을 수 없습니다." });
        }

        res.status(200).json({
            message: "ok",
            data: story
        });
    } catch (error) {
        console.error(" 스토리 상세 조회 오류:", error);
        res.status(500).json({ message: "서버 오류" });
    }
};

const getStoryByLevel = async (req, res) => {
    try {
        const { level } = req.params;

        const stories = await db.Story.findAll({
            where: { langlevel: level },                   
            order: [['storyid', 'ASC']]                   
        });

        res.status(200).json({
            message: "ok",
            count: stories.length,
            data: stories
        });
    } catch (error) {
        console.error(" 스토리 레벨별 조회 오류:", error);
        res.status(500).json({ message: "서버 오류" });
    }
};

module.exports = {
    getStories,
    getStoryById,
    getStoryByLevel
};