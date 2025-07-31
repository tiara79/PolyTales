const db = require("../models");

// === 조회 관련 시작 ===
// GET /stories - 전체 스토리 목록 조회
const getStories = async (req, res) => {
    try {
        console.log('getStories 함수 시작');
        
        const { level, topic } = req.query;
        let whereCondition = {};
        if (level) whereCondition.langlevel = level;      
        if (topic) whereCondition.topic = topic;
        
        console.log('조건:', whereCondition);
        
        const stories = await db.Story.findAll({
            where: whereCondition,
            order: [['storyid', 'ASC']]                    
        });

        console.log('조회된 스토리 개수:', stories.length);

        res.status(200).json({
            message: "전체 스토리 조회 성공",
            count: stories.length,
            data: stories,
        });
    } catch (error) {
        console.error("전체 스토리 조회 오류:", error);
        res.status(500).json({ 
            message: "서버 오류", 
            error: error.message 
        });
    }
};

// GET /stories/levels - 레벨 목록 조회
const getAllLevels = async (req, res) => {
    try {
        console.log('getAllLevels 함수 시작');

        const levels = await db.Story.findAll({
            attributes: [
                [db.Sequelize.fn('DISTINCT', db.Sequelize.col('langlevel')), 'langlevel']
            ],
            order: [['langlevel', 'ASC']],
            raw: true
        });

        const levelList = levels.map(item => item.langlevel);
        console.log('조회된 레벨 목록:', levelList);

        res.status(200).json({
            message: "레벨 목록 조회 성공",
            count: levelList.length,
            data: levelList
        });
    } catch (error) {
        console.error("레벨 목록 조회 오류:", error);
        res.status(500).json({ 
            message: "서버 오류",
            error: error.message 
        });
    }
};

// GET /stories/level/:level - 특정 레벨의 모든 스토리 조회
const getStoryByLevel = async (req, res) => {
    try {
        console.log('getStoryByLevel 함수 시작');
        const { level } = req.params;
        console.log('요청된 레벨:', level);

        const stories = await db.Story.findAll({
            where: { langlevel: level },
            order: [['storyid', 'ASC']]
        });

        console.log(`${level} 레벨 스토리 개수:`, stories.length);

        if (stories.length === 0) {
            return res.status(404).json({
                message: `${level} 레벨의 스토리를 찾을 수 없습니다.`,
                count: 0,
                data: []
            });
        }

        res.status(200).json({
            message: `${level} 레벨 스토리 조회 성공`,
            count: stories.length,
            data: stories
        });
    } catch (error) {
        console.error("레벨별 스토리 조회 오류:", error);
        res.status(500).json({ 
            message: "서버 오류",
            error: error.message
        });
    }
};

// GET /stories/:level/detail/:id - 특정 레벨의 특정 스토리 상세 조회
const getStoryById = async (req, res) => {
    try {
        console.log('getStoryById 함수 시작');
        const { level, id } = req.params;
        console.log(`${level} 레벨의 ${id}번 스토리 조회`);

        const story = await db.Story.findOne({
            where: { 
                storyid: id,
                langlevel: level
            }
        });

        if (!story) {
            return res.status(404).json({ 
                message: `${level} 레벨에서 ID ${id} 스토리를 찾을 수 없습니다.` 
            });
        }

        console.log('스토리 조회 성공:', story.storytitle);

        res.status(200).json({
            message: "스토리 상세 조회 성공",
            data: story
        });
    } catch (error) {
        console.error("스토리 상세 조회 오류:", error);
        res.status(500).json({ 
            message: "서버 오류",
            error: error.message
        });
    }
};
// === 조회 관련 끝 ===

// === 생성/수정/삭제 관련 시작 ===
// POST /stories - 새 스토리 생성
const createStory = async (req, res) => {
    try {
        console.log('createStory 함수 시작');
        console.log('요청 데이터:', req.body);

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
                message: "제목과 언어 레벨은 필수입니다."
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

        console.log('스토리 생성 성공:', newStory.storyid);

        res.status(201).json({
            message: "스토리 생성 성공",
            data: {
                storyid: newStory.storyid,
                storytitle: newStory.storytitle,
                langlevel: newStory.langlevel,
                topic: newStory.topic
            }
        });
    } catch (error) {
        console.error("스토리 생성 오류:", error);
        res.status(500).json({
            message: "서버 오류",
            error: error.message
        });
    }
};

// PUT /stories/:level/detail/:id - 특정 스토리 수정
const updateStory = async (req, res) => {
    try {
        console.log('updateStory 함수 시작');
        const { level, id } = req.params;
        console.log(`요청: ${level} 레벨의 ${id}번 스토리 수정`);
        
        // 디버깅: 요청 데이터 확인
        console.log('req.body:', JSON.stringify(req.body, null, 2));
        console.log('req.body가 비어있나?', Object.keys(req.body).length === 0);

        // 기존 스토리 존재 확인 (ID 체크)
        const existingStory = await db.Story.findOne({
            where: { storyid: id }
        });

        if (!existingStory) {
            return res.status(404).json({
                message: `ID ${id} 스토리를 찾을 수 없습니다.`
            });
        }

        console.log(`실제 스토리: ${existingStory.langlevel} 레벨의 "${existingStory.storytitle}"`);

        // 업데이트할 데이터가 있는지 확인
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: "업데이트할 데이터가 없습니다."
            });
        }

        console.log('업데이트 시작...');
        
        // 스토리 업데이트 (ID로 업데이트)
        const [updatedCount] = await db.Story.update(req.body, {
            where: { storyid: id }
        });

        console.log('업데이트 결과:', updatedCount);

        if (updatedCount === 0) {
            return res.status(400).json({
                message: "스토리 수정에 실패했습니다."
            });
        }

        // 수정된 스토리 조회
        const updatedStory = await db.Story.findOne({
            where: { storyid: id }
        });

        console.log('스토리 수정 성공');

        res.status(200).json({
            message: "스토리 수정 성공",
            data: updatedStory
        });
    } catch (error) {
        console.error("스토리 수정 오류:", error);
        res.status(500).json({
            message: "서버 오류",
            error: error.message
        });
    }
};

// DELETE /stories/:level/detail/:id - 스토리 삭제
const deleteStory = async (req, res) => {
    try {
        console.log('deleteStory 함수 시작');
        const { level, id } = req.params;
        console.log(`${level} 레벨의 ${id}번 스토리 삭제`);

        // 기존 스토리 존재 확인
        const existingStory = await db.Story.findOne({
            where: { 
                storyid: id,
                langlevel: level
            }
        });

        if (!existingStory) {
            return res.status(404).json({
                message: `${level} 레벨에서 ID ${id} 스토리를 찾을 수 없습니다.`
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
                message: "스토리 삭제에 실패했습니다."
            });
        }

        console.log('스토리 삭제 성공');

        res.status(200).json({
            message: "스토리 삭제 성공",
            data: {
                deletedStoryId: id,
                deletedLevel: level,
                deletedTitle: existingStory.storytitle
            }
        });
    } catch (error) {
        console.error("스토리 삭제 오류:", error);
        res.status(500).json({
            message: "서버 오류",
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