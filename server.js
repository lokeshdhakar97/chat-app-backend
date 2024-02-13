require("dotenv").config();
const express = require("express");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messsageRoutes = require("./routes/messageRoutes");
const connectDB = require("./lib/db");
const cors = require("cors");

const app = express();
connectDB();

app.use(express.json());
app.use(cors((origin = "http://localhost:3000")));
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messsageRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
