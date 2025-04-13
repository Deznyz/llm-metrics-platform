const axios = require("axios");

const API_KEY = "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"; // Replace with your OpenAI API key

async function classifyWithGPT(emailText, retryCount = 0) {
    try {
        const messages = [
            {
                role: "system",
                content: 'You are a classifier that labels emails as "phishing" or "legitimate", you should only answer in one word, either "phishing" or "legitimate".',
            },
            {
                role: "user",
                content: `${emailText}`,
            },
        ];

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: messages,
                max_tokens: 10,
            },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
        console.error("Error with OpenAI API:", error);

        if (retryCount < 3) {
            console.warn(`Retrying... Attempt ${retryCount + 1}`);
            return await classifyWithGPT(emailText, retryCount + 1);
        }

        return "error";
    }
}

module.exports = { classifyWithGPT };