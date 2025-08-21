// back/src/controllers/tutorController.js
const axios = require("axios");

const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;

const askAzureGPT = async (messages) => {
  const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`;
  const headers = {
    "Content-Type": "application/json",
    "api-key": AZURE_OPENAI_KEY,
  };

  const data = {
    messages,
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  const res = await axios.post(url, data, { headers });
  return res.data?.choices?.[0]?.message?.content || "";
};

module.exports.createChat = async (req, res) => {
  try {
    const { storyid, message } = req.body || {};
    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }

    const messages = [
      { role: "system", content: "You are a friendly and helpful AI English tutor for kids." },
      { role: "user", content: message },
    ];

    const reply = await askAzureGPT(messages);

    return res.json({
      ok: true,
      data: {
        storyid: storyid ?? null,
        reply,
        ts: Date.now(),
      },
    });
  } catch (error) {
    console.error("GPT 오류:", error?.message);
    return res.status(500).json({ message: "GPT 호출 실패" });
  }
};
