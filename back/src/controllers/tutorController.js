//src/controllers/tutorsController.js

const db = require('../models');
const Tutor = db.Tutor;
const { Op } = db.Sequelize;
const axios = require('axios');

// ──────────────── 메시지 생성 ────────────────
const createMessage = async (req, res) => {
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
const getMessagesByStory = async (req, res) => {
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
const getPagedMessages = async (req, res) => {
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
const deleteMessage = async (req, res) => {
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
const getSummary = async (req, res) => {
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

// 새로운 채팅 API 추가
const createChat = async (req, res) => {
  try {
    const { userid, storyid, message, lang } = req.body;
    
    if (!userid || !storyid || !message) {
      return res.status(400).json({ message: '필수 필드가 누락되었습니다.' });
    }

    // 사용자 메시지 저장
    await Tutor.create({
      userid,
      storyid,
      sender: 'user',
      message
    });

    // Azure OpenAI API 호출 (실제 구현 시)
    let aiResponse = "죄송합니다. 현재 AI 서비스에 연결할 수 없습니다.";
    
    try {
      // 실제 Azure OpenAI 연결 코드
      // const response = await axios.post('your-azure-openai-endpoint', {
      //   messages: [{ role: 'user', content: message }],
      //   max_tokens: 150
      // }, {
      //   headers: {
      //     'Authorization': `Bearer ${process.env.AZURE_OPENAI_KEY}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // aiResponse = response.data.choices[0].message.content;
      
      // 임시 응답 (개발용)
      aiResponse = `"${message}"에 대한 답변입니다. 현재 개발 중인 기능으로 임시 응답을 제공합니다.`;
    } catch (error) {
      console.error('AI API 호출 오류:', error);
      aiResponse = "죄송합니다. 현재 AI 서비스에 일시적인 문제가 있습니다.";
    }

    // AI 응답 저장
    await Tutor.create({
      userid,
      storyid,
      sender: 'pola',
      message: aiResponse
    });

    res.json({ 
      message: 'ok',
      response: aiResponse 
    });

  } catch (error) {
    console.error('Chat creation error:', error);
    res.status(500).json({ message: 'server error', error: error.message });
  }
};

module.exports = {
  createMessage,
  getMessagesByStory,
  deleteMessage,
  getSummary,
  createChat,
  getPagedMessages // 필요시 추가
};
