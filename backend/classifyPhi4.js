const axios = require("axios");

const API_KEY = "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";

async function classifyWithPhi4(emailText, retryCount = 0) {
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
                model: "microsoft/phi-4",
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
        console.error("Error with DeepInfra API:", error);

        if (retryCount < 3) {
            console.warn(`Retrying... Attempt ${retryCount + 1}`);
            return await classifyWithPhi4(emailText, retryCount + 1);
        }

        return "error";
    }
}

module.exports = { classifyWithPhi4 };
