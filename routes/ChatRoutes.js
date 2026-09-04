const express = require("express");

const {
    chat,
    chatStream
} = require("../controllers/ChatController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/chat", protect, chat);

router.post("/chat/stream", protect, chatStream);

module.exports = router;