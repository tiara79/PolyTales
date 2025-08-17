// back/src/controllers/tutorController.js
module.exports.createChat = async (req, res) => {
  try {
    const { storyid, message } = req.body || {};
    if (!message) return res.status(400).json({ message: 'message is required' });

    return res.json({
      ok: true,
      data: {
        storyid: storyid ?? null,
        reply: message,
        ts: Date.now(),
      },
    });
  } catch (e) {
    return res.status(500).json({ message: 'tutor error' });
  }
};
