const express = require("express");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const tokenGenerator = require("../lib/tokenGenerator");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const searchTerm = req.query.search;
    const query = {
      $or: [
        { username: { $regex: searchTerm, $options: "i" } }, // Case-insensitive regex for name
        { email: { $regex: searchTerm, $options: "i" } }, // Case-insensitive regex for email
      ],
    };

    // Use the User model to find matching users
    // const users = await User.find(query);

    // Respond with the found users
    res.json(query);
  })
);

router.post(
  "/register",
  asyncHandler(async (req, res) => {
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
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

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
  })
);

module.exports = router;
