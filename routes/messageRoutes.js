const express = require("express");
const isAuth = require("../middleware/authMiddleware");
const Message = require("../models/messageModel");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

// send message
router.post(
  "/",
  isAuth,
  asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;
    if (!content || !content.trim()) {
      res.status(400).json({ message: "Content is required" });
    }

    if (!chatId) {
      res.status(400).json({ message: "Chat ID is required" });
    }

    if (!chatId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ message: "Invalid chat ID" });
    }

    let messageData = {
      sender: req.user._id,
      content,
      chat: chatId,
    };
    try {
      let message = await Message.create(messageData);
      message = await message.populate("sender", "username email");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "username email",
      });

      await Chat.findByIdAndUpdate(chatId, {
        latestMessage: message,
      });

      res.status(201).json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  })
);

// get all messages
router.get(
  "/",
  isAuth,
  asyncHandler(async (req, res) => {
    if (req.query.chatId === "") {
      res.json({ message: "Chat Id is required" });
    } else if (!req.query.chatId.match(/^[0-9a-fA-F]{24}$/)) {
      res.json({ message: "Invalid chat Id" });
    }
    try {
      const message = await Message.find({ chat: req.query.chatId })
        .populate("sender", "username email")
        .populate("chat");
      res.status(201).json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  })
);

module.exports = router;
