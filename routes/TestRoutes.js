const express = require("express");
const router = express.Router();

const {
    createTestUser
} = require("../controllers/TestController");

router.post("/test-user", createTestUser);

module.exports = router;