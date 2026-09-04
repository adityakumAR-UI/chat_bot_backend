const mongoose = require("mongoose");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const {
    generateResponse,
    generateStream
} = require("../services/llmService");


const chat = async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        if (typeof userMessage !== "string") {
            return res.status(400).json({
                error: "Message must be a string"
            });
        }

        if (userMessage.trim().length === 0) {
            return res.status(400).json({
                error: "Message cannot be empty"
            });
        }

        if (userMessage.length > 10000) {
            return res.status(400).json({
                error: "Message is too long"
            });
        }

        const response = await generateResponse(
            userMessage.trim()
        );

        res.json({
            response
        });
    } catch (error) {
        console.error("CHAT ERROR:", error);

        let statusCode = 500;

        if (error.status === 429) {
            statusCode = 429;
        } else if (error.status === 503) {
            statusCode = 503;
        }

        res.status(statusCode).json({
            error:
                statusCode === 429
                    ? "Too many requests. Please try again later."
                    : statusCode === 503
                    ? "AI service is temporarily unavailable."
                    : "Failed to generate response"
        });
    }
};


const chatStream = async (req, res) => {
    try {
        const userMessage = req.body.message;
        const conversationId = req.body.conversationId;

        const userId = req.user.userId;

        if (!userMessage) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        if (typeof userMessage !== "string") {
            return res.status(400).json({
                error: "Message must be a string"
            });
        }

        if (userMessage.trim().length === 0) {
            return res.status(400).json({
                error: "Message cannot be empty"
            });
        }

        if (userMessage.length > 10000) {
            return res.status(400).json({
                error: "Message is too long"
            });
        }

        const message = userMessage.trim();

        let conversation;

        if (conversationId) {
            if (!mongoose.Types.ObjectId.isValid(conversationId)) {
                return res.status(400).json({
                    error: "Invalid conversation ID"
                });
            }

            conversation = await Conversation.findOne({
                _id: conversationId,
                userId
            });

            if (!conversation) {
                return res.status(404).json({
                    error: "Conversation not found"
                });
            }
        } else {
            conversation = await Conversation.create({
                userId,
                title: message.slice(0, 40)
            });
        }

        const previousMessages = await Message.find({
            conversationId: conversation._id
        })
            .sort({
                createdAt: 1
            })
            .lean();

        await Message.create({
            conversationId: conversation._id,
            role: "user",
            content: message
        });

        res.setHeader(
            "Content-Type",
            "text/event-stream"
        );

        res.setHeader(
            "Cache-Control",
            "no-cache"
        );

        res.setHeader(
            "Connection",
            "keep-alive"
        );

        res.write(
            `data: ${JSON.stringify({
                type: "conversation",
                conversationId: conversation._id
            })}\n\n`
        );

        const stream = await generateStream(
            previousMessages,
            message
        );

        let assistantResponse = "";

        for await (const chunk of stream) {
            const text = chunk.text;

            if (!text) {
                continue;
            }

            assistantResponse += text;

            res.write(
                `data: ${JSON.stringify({
                    type: "chunk",
                    content: text
                })}\n\n`
            );
        }

        if (assistantResponse) {
            await Message.create({
                conversationId: conversation._id,
                role: "assistant",
                content: assistantResponse
            });
        }

        conversation.updatedAt = new Date();

        await conversation.save();

        res.write(
            `data: ${JSON.stringify({
                type: "done"
            })}\n\n`
        );

        res.end();

    } catch (error) {
        console.error(
            "GEMINI STREAM ERROR:",
            error
        );

        if (!res.headersSent) {
            if (error.status === 429) {
                return res.status(429).json({
                    error: "Gemini quota exceeded. Please try again later."
                });
            }

            if (error.status === 503) {
                return res.status(503).json({
                    error: "Gemini is temporarily unavailable."
                });
            }

            return res.status(500).json({
                error: "Failed to generate response"
            });
        }

        res.write(
            `data: ${JSON.stringify({
                type: "error",
                content: "Failed to generate response"
            })}\n\n`
        );

        res.end();
    }
};


module.exports = {
    chat,
    chatStream
};