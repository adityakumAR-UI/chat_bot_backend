const User = require("../models/User");

const createTestUser = async (req, res) => {
    try {
        let user = await User.findOne({
            email: "test@example.com"
        });

        if (!user) {
            user = await User.create({
                name: "Test User",
                email: "test@example.com"
            });
        }

        res.json({
            message: "Test user ready",
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to create test user"
        });
    }
};

module.exports = {
    createTestUser
};