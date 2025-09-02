const express = require("express");
const protectRoute = require("../middlewares/auth.middleware");
const { lockchat, unlockchat, targetUser } = require("../controllers/chatlock.controller");
const router = express.Router();

router.post("/lock", protectRoute, lockchat)
router.post("/unlock", protectRoute, unlockchat)
router.get("/status/:targetUserId", protectRoute, targetUser)

module.exports = router;
