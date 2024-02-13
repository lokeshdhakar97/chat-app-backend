const express = require("express");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const tokenGenerator = require("../lib/tokenGenerator");
const isAuth = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users
router.get(
  "/",
  isAuth,
  asyncHandler(async (req, res) => {
    try {
      const searchTerm = req.query.search;

      if (!searchTerm) {
        res.status(400).json({ message: "Please type something..." });
        throw new Error("Please provide a search term");
      }

      const query = {
        $or: [
          { username: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ],
      };

      const users = await User.find(query).find({
        _id: { $ne: req.user?._id },
      });

      res.json(users.length > 0 ? users : { message: "No users found" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
      throw new Error(error.message);
    }
  })
);

// Create a new user
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({ message: "Please fill in all fields" });
        throw new Error("Please fill in all fields");
      }

      const userExists = await User.findOne({ email });

      if (userExists) {
        res.status(400).json({ message: "User already exists" });
        throw new Error("User already exists");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          password: user.password,
          token: tokenGenerator(user._id),
        });
      } else {
        res.status(400).json({ message: "Invalid user data" });
        throw new Error("Invalid user data");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  })
);

// Login user
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Please fill in all fields" });
        throw new Error("Please fill in all fields");
      }

      const user = await User.findOne({ email });

      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          token: tokenGenerator(user._id),
        });
      } else {
        res.status(401).json({ message: "Invalid email or password" });
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  })
);

module.exports = router;
