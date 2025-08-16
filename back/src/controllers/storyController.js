const db = require("../models");
const { toImgUrl } = require("../utils/pathFixers"); // 이미지 경로를 절대 경로로 변환하는 유틸리티 함수

// === 조회 관련 시작 ===
// GET /stories - 전체 스토리 목록 조회
const getStories = async (req, res) => {
    try {
        // console.log('Start the getStories function');
        
        const { level, topic } = req.query;
        let whereCondition = {};
        if (level) whereCondition.langlevel = level;      
        if (topic) whereCondition.topic = topic;
        
        // console.log('condition:', whereCondition);
        
        const stories = await db.Story.findAll({
            where: whereCondition,
            order: [['storyid', 'ASC']]                    
        });

        // console.log('Number of retrieved stories:', stories.length);

        res.status(200).json({
            message: "Full Story View Success",
            count: stories.length,
            data: stories,
        });
    } catch (error) {
        console.error("Failed to retrieve all stories:", error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

// GET /stories/levels - 레벨 목록 조회
const getAllLevels = async (req, res) => {
    try {
        // console.log('Start the getAllLevels function');

        const levels = await db.Story.findAll({
            attributes: [
                [db.Sequelize.fn('DISTINCT', db.Sequelize.col('langlevel')), 'langlevel']
            ],
            order: [['langlevel', 'ASC']],
            raw: true
        });

        const levelList = levels.map(item => item.langlevel);
        // console.log('Retrieved language levels:', levelList);

        res.status(200).json({
            message: "Level list retrieved successfully",
            count: levelList.length,
            data: levelList
        });
    } catch (error) {
        // console.error("Failed to retrieve language levels:", error);
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
};

// GET /stories/level/:level - 특정 레벨의 모든 스토리 조회
const getStoryByLevel = async (req, res) => {
    try {
        // console.log('Start the getStoryByLevel function');
        const { level } = req.params;
        // console.log('Requested level:', level);

        const stories = await db.Story.findAll({
            where: { langlevel: level },
            order: [['storyid', 'ASC']]
        });

        // console.log(`${level} Number of level stories:`, stories.length);

        if (stories.length === 0) {
            return res.status(404).json({
                message: `${level} Level stories not found.`,
                count: 0,
                data: []
            });
        }

        res.status(200).json({
            message: `${level} Level stories retrieved successfully`,
            count: stories.length,
            data: stories
        });
    } catch (error) {
        console.error("Failed to retrieve level stories:", error);
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message
        });
    }
};

// GET /stories/:level/detail/:id - 특정 레벨의 특정 스토리 상세 조회
const getStoryById = async (req, res) => {
    try {
        // console.log('Start the getStoryById function');
        const { level, id } = req.params;
        // console.log(`Look up the ${id} story at the ${level} level`);

        const story = await db.Story.findOne({
            where: { 
                storyid: id,
                langlevel: level
            }
        });

        if (!story) {
            return res.status(404).json({ 
                message: `${level} Level story not found.` 
            });
        }

        // console.log('Story retrieval successful:', story.storytitle);

        res.status(200).json({
            message: "Story detail retrieval successful",
            data: story
        });
    } catch (error) {
        console.error("Failed to retrieve story details:", error);
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message
        });
    }
};
// === 조회 관련 끝 ===

// === 생성/수정/삭제 관련 시작 ===
// POST /stories - 새 스토리 생성
const createStory = async (req, res) => {
    try {
        // console.log('Start the createStory function');
        // console.log('Requested data:', req.body);

        const { 
            storytitle, 
            storycoverpath, 
            thumbnail, 
            movie, 
            description, 
            langlevel, 
            langlevelko, 
            nation, 
            topic 
        } = req.body;

        // 필수 필드 검증
        if (!storytitle || !langlevel) {
            return res.status(400).json({
                message: "Title and language level are required."
            });
        }

        const newStory = await db.Story.create({
            storytitle,
            storycoverpath: storycoverpath || null,
            thumbnail: thumbnail || null,
            movie: movie || null,
            description: description || null,
            langlevel,
            langlevelko: langlevelko || null,
            nation: nation || null,
            topic: topic || null
        });

        // console.log('Story creation successful:', newStory.storyid);

        res.status(201).json({
            message: "Story creation successful",
            data: {
                storyid: newStory.storyid,
                storytitle: newStory.storytitle,
                langlevel: newStory.langlevel,
                topic: newStory.topic
            }
        });
    } catch (error) {
        console.error("Failed to create story:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// PUT /stories/:level/detail/:id - 특정 스토리 수정
const updateStory = async (req, res) => {
    try {
        // console.log('Start the updateStory function');
        const { level, id } = req.params;
        // console.log(`Request: Update story ${id} at level ${level}`);

        // Debugging: Check request data
        // console.log('req.body:', JSON.stringify(req.body, null, 2));
        // console.log('Is req.body empty?', Object.keys(req.body).length === 0);

        // 기존 스토리 존재 확인 (ID 체크)
        const existingStory = await db.Story.findOne({
            where: { storyid: id }
        });

        if (!existingStory) {
            return res.status(404).json({
                message: `The story ID ${id} was not found.`
            });
        }

        // console.log(`Actual story: ${existingStory.langlevel} level "${existingStory.storytitle}"`);

        // 업데이트할 데이터가 있는지 확인
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: "No data provided for update."
            });
        }

        // console.log('Update started...');
        
        // 스토리 업데이트 (ID로 업데이트)
        const [updatedCount] = await db.Story.update(req.body, {
            where: { storyid: id }
        });

        // console.log('Update result:', updatedCount);

        if (updatedCount === 0) {
            return res.status(400).json({
                message: "Failed to update story."
            });
        }

        // 수정된 스토리 조회
        const updatedStory = await db.Story.findOne({
            where: { storyid: id }
        });

        // console.log('스토리 수정 성공');
        // console.log('Story update successful');

        res.status(200).json({
            message: "Successful story modification",
            data: updatedStory
        });
    } catch (error) {
        console.error("Failed to update story:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// DELETE /stories/:level/detail/:id - 스토리 삭제
const deleteStory = async (req, res) => {
    try {
        // console.log('deleteStory function started');
        const { level, id } = req.params;
        // console.log(`Delete Story ${id} at ${level} level`);

        // 기존 스토리 존재 확인
        const existingStory = await db.Story.findOne({
            where: { 
                storyid: id,
                langlevel: level
            }
        });

        if (!existingStory) {
            return res.status(404).json({
                message: `The story ID ${id} at level ${level} was not found.`
            });
        }

        // 스토리 삭제
        const deletedCount = await db.Story.destroy({
            where: { 
                storyid: id,
                langlevel: level
            }
        });

        if (deletedCount === 0) {
            return res.status(400).json({
                message: "Failed to delete story."
            });
        }

        // console.log('Story deletion successful.');

        res.status(200).json({
            message: "Successful story deletion",
            data: {
                deletedStoryId: id,
                deletedLevel: level,
                deletedTitle: existingStory.storytitle
            }
        });
    } catch (error) {
        console.error("Failed to delete story:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    // 조회 관련
    getStories,
    getAllLevels,
    getStoryByLevel,
    getStoryById,
    
    // 생성/수정/삭제 관련
    createStory,
    updateStory,
    deleteStory
};