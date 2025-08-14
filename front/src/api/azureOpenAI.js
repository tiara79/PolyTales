import axios from "./axios";

export async function askAzureGPT(messages, options = {}) {
    const res = await axios.post("/api/azure-gpt", {
        messages,
        ...options,
    });
    // 응답 형식: { choices: [ { message: { content: ... } } ] }
    return res.data.choices?.[0]?.message?.content || "";
}
