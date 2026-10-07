const Conversation = require("../models/Conversation");
const Message = require("../models/Message");




const getConversations = async (req, res) => {
    try {
        const userId = req.user.userId;

        const conversations = await Conversation.find({
            userId
        }).sort({
            updatedAt: -1
        });

        res.json({
            conversations
        });

    } catch (error) {
        console.error(
            "GET CONVERSATIONS ERROR:",
            error
        );

        res.status(500).json({
            error: "Failed to fetch conversations"
        });
    }
};




const getMessages = async (req, res) => {
    try {
        const { id } = req.params;

        const userId = req.user.userId;

        const conversation =
            await Conversation.findOne({
                _id: id,
                userId
            });

        if (!conversation) {
            return res.status(404).json({
                error: "Conversation not found"
            });
        }

        const messages =
            await Message.find({
                conversationId: id
            }).sort({
                createdAt: 1
            });

        res.json({
            conversation,
            messages
        });

    } catch (error) {
        console.error(
            "GET MESSAGES ERROR:",
            error
        );

        res.status(500).json({
            error: "Failed to fetch messages"
        });
    }
};


module.exports = {
    getConversations,
    getMessages
};
