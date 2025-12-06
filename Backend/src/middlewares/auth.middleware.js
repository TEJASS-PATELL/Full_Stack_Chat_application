const jwt = require("jsonwebtoken");
const pool = require("../lib/db");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600 }); 

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "Unauthorized - No Token Provided" });

    const decoded = jwt.verify(token, process.env.JWT_ID);
    const userId = decoded.userId;
    const cacheKey = `user_auth_${userId}`;
    const cachedUser = cache.get(cacheKey);

    if (cachedUser) {
      await pool.query("UPDATE users SET lastseen = NOW() WHERE id = $1", [userId]);
      req.user = cachedUser;
      return next();
    }

    const { rows } = await pool.query(
      "SELECT id, fullname, email, profilepic, createdat FROM users WHERE id = $1",
      [userId]
    );

    if (!rows[0]) return res.status(404).json({ message: "User not found" });

    const user = rows[0];

    cache.set(cacheKey, user, 3600); 

    await pool.query("UPDATE users SET lastseen = NOW() WHERE id = $1", [userId]);
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
    }
    console.error("ProtectRoute Error:", error.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = protectRoute;