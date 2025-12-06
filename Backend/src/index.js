const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routers/auth.route");
const messageRoutes = require("./routers/message.route");
const chatLockRoutes = require("./routers/chatLock.route");
const { looseLimiter } = require("./helper/limiter");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const compression = require("compression");
const { server, app } = require("./lib/socket");
const ConnectUser = require("./models/user.model");
const createMessagesTable = require("./models/message.model");
const ChatLock = require("./models/chatlock.model");

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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, async () => {
  try {
    await ConnectUser();
    await createMessagesTable();
    await ChatLock();
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error(err.stack);
    process.exit(1);
  }
});
