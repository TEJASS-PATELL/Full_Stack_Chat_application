const pool = require("../lib/db");
const { generateToken } = require("../lib/utils");
const bcrypt = require("bcryptjs");
const cloudinary = require("../lib/cloudinary");

const signup = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const { rows: existingUser } = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows: result } = await pool.query(
      `INSERT INTO users (fullname, email, password, createdat) 
       VALUES ($1, $2, $3, NOW()) RETURNING id, fullname, email, profilepic`,
      [fullname, email, hashedPassword]
    );

    const newUser = result[0];
    generateToken(newUser.id, res);

    res.status(201).json({
      id: newUser.id,
      fullname: newUser.fullname,
      email: newUser.email,
      profilePic: newUser.profilepic || null,
    });

  } catch (error) {
    console.error("Error in signup controller:", error.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const { rows: userRows } = await pool.query(
      `SELECT id, fullname, email, password, profilepic FROM users WHERE email = $1`,
      [email]
    );

    if (userRows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = userRows[0];
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    await pool.query(
      `UPDATE users SET isonline = true, lastseen = NOW() WHERE id = $1`,
      [user.id]
    );

    generateToken(user.id, res);

    res.status(200).json({
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilepic || null,
    });

  } catch (error) {
    console.error("Error in login controller:", error.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (userId) {
      await pool.query(
        `UPDATE users SET isonline = false, lastseen = NOW() WHERE id = $1`,
        [userId]
      );
    }

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      path: "/",
    });

    res.status(200).json({ message: "Logged out successfully" });

  } catch (error) {
    console.error("Error in logout controller:", error.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { profilepic } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized: User ID missing" });
    if (!profilepic) return res.status(400).json({ message: "Profile pic is required" });

    const uploadResponse = await cloudinary.uploader.upload(profilepic, { folder: "user_profiles" });

    await pool.query(
      `UPDATE users SET profilepic = $1 WHERE id = $2`,
      [uploadResponse.secure_url, userId]
    );

    const { rows: updatedUser } = await pool.query(
      `SELECT id, fullname, email, profilepic, createdat FROM users WHERE id = $1`,
      [userId]
    );

    res.status(200).json(updatedUser[0]);

  } catch (error) {
    console.error("Error in updateProfile:", error.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkAuth = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    const { rows: userRows } = await pool.query(
      `SELECT id, fullname, email, profilepic, createdat, lastseen 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userRows[0];

    res.status(200).json({
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilepic || null,
      createdAt: user.createdat,
      lastSeen: user.lastseen,
    });
  } catch (error) {
    console.error("Error in checkAuth controller:", error.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized: User ID missing" });

    const { rowCount } = await pool.query(
      `DELETE FROM users WHERE id = $1`,
      [userId]
    );

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    if (rowCount === 0) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Account deleted successfully" });

  } catch (error) {
    console.error("deleteAccount error:", error.stack);
    res.status(500).json({ message: "Something went wrong while deleting account" });
  }
};

module.exports = {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
  deleteAccount
};
