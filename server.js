require("dotenv").config();
const express = require("express");

const cors = require("cors");
const connectDB = require("./config/db");

const chatRoutes = require("./routes/ChatRoutes.js");
const testRoutes = require("./routes/TestRoutes");
const conversationRoutes = require("./routes/ConversationRoutes");
const authRoutes = require("./routes/AuthRoutes");

const app = express();

const PORT = 5001;

app.use(cors());

app.use(express.json());

app.use("/api", chatRoutes);
app.use("/api", testRoutes);
app.use("/api", conversationRoutes);
app.use("/api/auth", authRoutes);


connectDB();

app.get("/api/health", (req, res) => {
    res.json({
        message: "Backend is running"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});