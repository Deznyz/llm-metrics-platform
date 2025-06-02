const axios = require("axios");

const API_KEY = "";

async function classifyWithGemini(emailText, retryCount = 0) {
    try {
        const messages = [
            {
                role: "system",
                content: 'You are a classifier that labels emails as "phishing" or "legitimate". It is crucial you respond with only one word: "phishing" or "legitimate". Do not repeat the anything from the email, the question, the instructions, date, or anything else but "phishing" or "legitimate".',
            },
            {
                role: "user",
                content: emailText,
            },
        ];

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "google/gemini-2.5-pro-preview",
                messages: messages,
                max_tokens: 100,
            },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost",
                    "X-Title": "Email Classifier",
                },
            }
        );
        //console.log("Gemini response:", response.data);
        
        return response.data.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
        console.error("Error with OpenRouter API:", error.response?.data || error.message);

        if (retryCount < 3) {
            console.warn(`Retrying... Attempt ${retryCount + 1}`);
            return await classifyWithGemini(emailText, retryCount + 1);
        }

        return "error";
    }
}

module.exports = { classifyWithGemini };
