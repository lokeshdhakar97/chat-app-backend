const express = require("express");
const isAuth = require("../middleware/authMiddleware");
const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const router = express.Router();

// One to One Chat Route
router.post(
  "/",
  isAuth,
  asyncHandler(async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res
          .status(400)
          .json({ message: "User ID is required to start conversation" });
      }

      let isChatExist = await Chat.find({
        $and: [
          { users: { $elemMatch: { $eq: req.user._id } } },
          { users: { $elemMatch: { $eq: userId } } },
        ],
      })
        .populate("users", "-password")
        .populate("latestMessage");

      isChatExist = await User.populate(isChatExist, {
        path: "latestMessage.sender",
        select: "username, email",
      });

      if (isChatExist.length > 0) {
        return res.json(isChatExist[0]);
      } else {
        const chatData = {
          chatName: "one2one",
          users: [req.user._id, userId],
        };

        const newChat = await Chat.create(chatData);
        const chatRes = await Chat.findOne({ _id: newChat._id }).populate(
          "users",
          "-password"
        );

        res.status(201).json(chatRes);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  })
);

// Get all chats of  User
router.get(
  "/",
  isAuth,
  asyncHandler(async (req, res) => {
    try {
      let chats = await Chat.find({
        users: { $elemMatch: { $eq: req.user._id } },
      })
        .populate("users", "-password")
        .populate("latestMessage")
        .populate("groupAdmin", "-password")
        .sort({ updatedAt: -1 });

      chats = await User.populate(chats, {
        path: "latestMessage.sender",
        select: "username, email",
      });

      res.status(200).json(chats);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  })
);


// Create Group Chat Route
router.post(
  "/room",
  isAuth,
  asyncHandler(async (req, res) => {
    try {
      res.json({ message: "create room" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  })
);

module.exports = router;
