const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routers/auth.route");
const messageRoutes = require("./routers/message.route");
const chatLockRoutes = require("./routers/chatLock.route");
const { looseLimiter } = require("./lib/limiter")
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const compression = require("compression");
const { server, app } = require("./lib/socket"); 

app.use(cors({
  origin: [process.env.CLIENT_URL, "http://localhost:5174", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.set("trust proxy", 1);
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(compression());
app.use("/api/auth", authRoutes);
app.use("/api/messages", looseLimiter, messageRoutes);
app.use("/api/chat-lock", chatLockRoutes);

server.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
