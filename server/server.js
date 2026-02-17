require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const sequelize = require("./config/db");
const pollRoutes = require("./routes/pollRoutes");
const setupSocket = require("./socket");

const app = express();
const server = http.createServer(app);

/*
==============================
SOCKET.IO WITH CORS
==============================
*/
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

/*
==============================
MIDDLEWARE
==============================
*/
app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

/*
==============================
MAKE SOCKET AVAILABLE IN ROUTES
==============================
*/
app.use((req, res, next) => {
  req.io = io;
  next();
});

/*
==============================
ROUTES
==============================
*/
app.use("/api/poll", pollRoutes);

/*
==============================
SOCKET HANDLER
==============================
*/
setupSocket(io);

/*
==============================
START SERVER
==============================
*/
sequelize.sync().then(() => {
  console.log("PostgreSQL Connected");

  server.listen(process.env.PORT, () => {
    console.log("Server running on port", process.env.PORT);
  });
});
