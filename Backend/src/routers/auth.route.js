const express = require("express");
const { login, logout, signup, updateProfile, checkAuth, deleteAccount } = require("../controllers/auth.controller");
const protectRoute = require("../middlewares/auth.middleware.js");  
const { strictLimiter } = require("../lib/limiter.js");

const router = express.Router();

router.post("/signup", strictLimiter, signup);
router.post("/login", strictLimiter, login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);  
router.delete("/delete-account", protectRoute, deleteAccount);

module.exports = router;

