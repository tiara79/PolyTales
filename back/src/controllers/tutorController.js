//src/controllers/tutorsController.js

const db = require('../models');
const Tutor = db.Tutor;
 // Sequelize에서 제공하는 연산자(Operators) 모음 객체 : SQL의 WHERE, BETWEEN, LIKE, OR, IN 같은 조건을 자바스크립트 코드로 쓸 수 있게 해주는 객체
const {Op} = db.Sequelize;

// ──────────────── 메시지 생성 ────────────────
exports.createMessage = async (req, res) => {
  try {
    const { userid, storyid, sender, message } = req.body;
    const newMessage = await Tutor.create({ userid, storyid, sender, message });
    res.status(201).json(newMessage);
  } catch (error) {
    // console.error('Tutor createMessage error:', error);
    res.status(500).json({ message: 'server error', error: error.message });
  }
};

// 당일 story 대화에 한해서만 전체 조회 (GET /tutor/:storyid)
exports.getMessagesByStory = async (req, res) => {
  try {
    const { storyid } = req.params;
    const { userid } = req.query; 

    // 당일 날짜 기준 범위 (00:00:00 ~ 23:59:59)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const messages = await Tutor.findAll({
      where: {
        storyid,
        userid,
        createdat: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      order: [['createdat', 'ASC']],
    });

    res.json(messages);
  } catch (error) {
    // console.error('Tutor getMessagesByStory error:', error);
    res.status(500).json({ message: 'server error', error: error.message });
  }
};

// ──────────────── 페이징 기반 메시지 조회 ────────────────
exports.getPagedMessages = async (req, res) => {
  try {
    const { storyid } = req.params;
    const { userid, limit = 10, offset = 0, sort = 'DESC' } = req.query;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const messages = await Tutor.findAll({
      where: {
        storyid,
        userid,
        createdat: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      order: [['createdat', sort.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'server error', error: error.message });
  }
};

// ──────────────── 튜터 페이지 메시지 삭제 ────────────────
// DELETE /tutor/:chatid
exports.deleteMessage = async (req, res) => {
  try {
    const { chatid } = req.params;
    const { userid } = req.query;

    if (!userid) {
      return res.status(400).json({ message: 'userid는 필수입니다.' });
    }

    // 본인이 작성한 메시지인지 확인
    const deleted = await Tutor.destroy({
      where: {
        chatid,
        userid
      }
    });

    if (deleted === 0) {
      return res.status(403).json({
        message: '삭제 권한이 없거나 메시지를 찾을 수 없습니다.'
      });
    }

    res.json({ message: '삭제 성공', chatid });
  } catch (error) {
    res.status(500).json({ message: 'server error', error: error.message });
  }
};

// 튜터 대화 정리-> 노트에 저장 (GET /tutor/summary/:storyid?userid=1)
exports.getSummary = async (req, res) => {
  try {
    const { storyid } = req.params;
    const { userid } = req.query;

    if (!userid) {
      return res.status(400).json({ message: 'userid는 필수입니다.' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const messages = await Tutor.findAll({
      where: {
        storyid,
        userid,
        createdat: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      order: [['createdat', 'ASC']],
    });

    if (!messages.length) {
      return res.json({ summary: '오늘 작성된 메시지가 없습니다.' });
    }

    const summary = messages.map(m => `(${m.sender}) ${m.message}`).join('\n');

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: 'server error', error: error.message });
  }
};

