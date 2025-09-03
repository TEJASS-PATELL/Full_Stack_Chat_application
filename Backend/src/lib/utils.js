const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const generateToken = (userId, res) => {
  try {
    const secretKey = process.env.JWT_SECRET || "mysecretkey";

    const token = jwt.sign({ userId }, secretKey, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      httpOnly: true,
      sameSite: "none", 
      secure: process.env.NODE_ENV === "production", 
    });

    return token;
  } catch (error) {
    console.error("Error generating token:", error.message);
    throw new Error("Token generation failed");
  }
};

module.exports = { generateToken };
