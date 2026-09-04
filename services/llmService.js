const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ==========================================
// NORMAL RESPONSE
// ==========================================

const generateResponse = async (message) => {
    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: message
                    }
                ]
            }
        ]
    });

    return response.text;
};


// ==========================================
// STREAMING RESPONSE
// ==========================================

const generateStream = async (
    previousMessages,
    currentMessage
) => {
    const contents = [];

    // Add previous conversation messages
    for (const message of previousMessages) {
        if (!message.content) {
            continue;
        }

        contents.push({
            role:
                message.role === "assistant"
                    ? "model"
                    : "user",

            parts: [
                {
                    text: message.content
                }
            ]
        });
    }

    // Add current user message
    if (currentMessage && currentMessage.trim()) {
        contents.push({
            role: "user",

            parts: [
                {
                    text: currentMessage.trim()
                }
            ]
        });
    }

    // Make sure Gemini receives something
    if (contents.length === 0) {
        throw new Error(
            "No valid messages available for Gemini"
        );
    }

    const stream =
        await ai.models.generateContentStream({
            model: "gemini-3.6-flash",
            contents
        });

    return stream;
};


module.exports = {
    generateResponse,
    generateStream
};