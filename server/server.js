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
================================================
ALLOWED ORIGINS (LOCAL + PRODUCTION FRONTEND)
================================================
Add your Vercel URL here after deployment
*/
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL // set this in Render env after Vercel deploy
].filter(Boolean);

/*
================================================
SOCKET.IO CONFIG
================================================
*/
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

/*
================================================
EXPRESS MIDDLEWARE
================================================
*/
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

/*
================================================
HEALTH CHECK ROUTE (FIXES CANNOT GET /)
================================================
*/
app.get("/", (req, res) => {
  res.send("Real-Time Poll API running 🚀");
});

/*
================================================
MAKE SOCKET AVAILABLE IN ROUTES
================================================
*/
app.use((req, res, next) => {
  req.io = io;
  next();
});

/*
================================================
API ROUTES
================================================
*/
app.use("/api/poll", pollRoutes);

/*
================================================
SOCKET HANDLER
================================================
*/
setupSocket(io);

/*
================================================
START SERVER
================================================
*/
const PORT = process.env.PORT || 5000;

sequelize.sync()
  .then(() => {
    console.log("PostgreSQL Connected");

    server.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch(err => {
    console.error("Database connection failed:", err);
  });
