require("dotenv").config();
const express = require("express");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messsageRoutes = require("./routes/messageRoutes");
const connectDB = require("./lib/db");
const cors = require("cors");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
connectDB();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messsageRoutes);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("New user connected", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join_chat", (room) => {
    socket.join(room);
  });

  socket.on("send_message", (sendMessage) => {
    const chat = sendMessage?.chat;
    if (!chat.users) return console.log("Chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === sendMessage?.sender?._id) return;
      socket.in(user._id).emit("received_message", sendMessage);
    });
  });
});
