const axios = require("axios");

const API_KEY = ""; //replace with OpenRouter API key

async function classifyWithClaude(emailText, retryCount = 0) {
    try {
        const messages = [
            {
                role: "system",
                content: 'You are a classifier that labels emails as "phishing" or "legitimate". It is crucial you respond with only one word: "phishing" or "legitimate".',
            },
            {
                role: "user",
                content: emailText,
            },
        ];

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "anthropic/claude-3-sonnet-20240229",
                messages: messages,
                max_tokens: 10,
            },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost", // Optional but recommended
                    "X-Title": "Email Classifier",
                },
            }
        );

        return response.data.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
        console.error("Error with OpenRouter API:", error.response?.data || error.message);

        if (retryCount < 3) {
            console.warn(`Retrying... Attempt ${retryCount + 1}`);
            return await classifyWithClaude(emailText, retryCount + 1);
        }

        return "error";
    }
}

module.exports = { classifyWithClaude };
