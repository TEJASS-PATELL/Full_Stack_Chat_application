const jwt = require("jsonwebtoken");
const pool = require("../lib/db");

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "Unauthorized - No Token Provided" });

    const decoded = jwt.verify(token, process.env.JWT_ID);

    const { rows } = await pool.query(
      `SELECT id, fullname, email, profilepic, createdat FROM users WHERE id = $1`,
      [decoded.userId]
    );

    if (!rows[0]) return res.status(404).json({ message: "User not found" });

    await pool.query("UPDATE users SET lastseen = NOW() WHERE id = $1", [decoded.userId]);

    req.user = rows[0];
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.stack);
    if (error.name === "JsonWebTokenError") return res.status(401).json({ message: "Invalid token" });
    if (error.name === "TokenExpiredError") return res.status(401).json({ message: "Token expired" });
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = protectRoute;
