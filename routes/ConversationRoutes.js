const express = require("express");

const {
    getConversations,
    getMessages
} = require("../controllers/ConversationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/conversations",
    protect,
    getConversations
);

router.get(
    "/conversations/:id/messages",
    protect,
    getMessages
);

module.exports = router;