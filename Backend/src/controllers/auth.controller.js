const db = require("../lib/db"); 
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

    const connection = await db.getConnection();

    const [existingUser] = await connection.execute(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await connection.execute(
      `INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)`,
      [fullname, email, hashedPassword]
    );

    connection.release();

    const newUserId = result.insertId;
    generateToken(newUserId, res);

    res.status(201).json({
      id: newUserId,
      fullname,
      email,
      profilepic: null,
    });

  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  let connection;

  try {
    connection = await db.getConnection();

    const [user] = await connection.execute(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    if (user.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const validUser = user[0];

    const isPasswordCorrect = await bcrypt.compare(password, validUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Update isOnline = true and lastSeen = NOW()
    await connection.execute(
      `UPDATE users SET isOnline = 1, lastSeen = NOW() WHERE id = ?`,
      [validUser.id]
    );

    // ✅ Generate token in cookie
    generateToken(validUser.id, res);

    // ✅ Send response
    res.status(200).json({
      id: validUser.id,
      fullname: validUser.fullname,
      email: validUser.email,
      profilePic: validUser.profilepic,
    });

  } catch (error) {
    console.error("Error in login controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    // ✅ Always release connection
    if (connection) connection.release();
  }
};

const logout = async (req, res) => {
  let connection;

  try {
    const userId = req.user?.id;

    if (userId) {
      connection = await db.getConnection();

      await connection.execute(
        `UPDATE users SET isOnline = 0, lastSeen = NOW() WHERE id = ?`,
        [userId]
      );
    }

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    res.status(200).json({ message: "Logged out successfully" });

  } catch (error) {
    console.error("Error in logout controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });

  } finally {
    // ✅ Always release connection if opened
    if (connection) connection.release();
  }
};

const updateProfile = async (req, res) => {
  try {
    const { profilepic } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    if (!profilepic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    let uploadResponse;
    try {
      uploadResponse = await cloudinary.uploader.upload(profilepic, {
        folder: "user_profiles",
      });
    } catch (uploadErr) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    const connection = await db.getConnection();

    await connection.execute(
      `UPDATE users SET profilepic = ? WHERE id = ?`,
      [uploadResponse.secure_url, userId]
    );

    const [updatedUser] = await connection.execute(
      `SELECT id, fullname, email, profilepic, createdat FROM users WHERE id = ?`,
      [userId]
    );

    connection.release();

    res.status(200).json(updatedUser[0]);

  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkAuth = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await db.getConnection();

    const [user] = await connection.execute(
      `SELECT id, fullname, email, profilepic, createdat FROM users WHERE id = ?`,
      [userId]
    );

    connection.release();

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user[0]);
  } catch (error) {
    console.error("Error in checkAuth controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteAccount = async (req, res) => {
  let connection;
  try {
    const userId = req.user.id; 

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    connection = await db.getConnection();

    const [result] = await connection.execute(
      `DELETE FROM users WHERE id = ?`,
      [userId]
    );

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Account deleted successfully" });

  } catch (error) {
    console.error("deleteAccount error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong while deleting account" });
  } finally {
    if (connection) connection.release();
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
