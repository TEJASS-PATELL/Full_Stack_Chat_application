const express = require("express");
const protectRoute = require("../middlewares/auth.middleware");
const { getMessages, getUsersForSidebar, sendMessage, deleteMessageImage } = require("../controllers/message.controller");
const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

module.exports = router;
