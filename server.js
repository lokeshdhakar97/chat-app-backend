require("dotenv").config();
const express = require("express");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messsageRoutes = require("./routes/messageRoutes");
const connectDB = require("./lib/db");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
connectDB();

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messsageRoutes);

const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "*" },
});
io.on("connection", (socket) => {
  console.log("Check");
  console.log("New user connected");

  // socket.on("sendMessage", (message) => {
  //   io.emit("message", message); // Broadcast the message to all connected clients
  // });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
