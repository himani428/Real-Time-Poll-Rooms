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
====================================================
ALLOW LOCAL + ALL VERCEL DEPLOYMENTS
====================================================
*/
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000"
];

/*
Check if origin is allowed
*/
function corsOrigin(origin, callback) {

  if (!origin) return callback(null, true);

  // allow localhost
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  // allow ANY vercel deployment of your project
  if (origin.includes("vercel.app")) {
    return callback(null, true);
  }

  callback(new Error("Not allowed by CORS"));
}

/*
====================================================
SOCKET.IO
====================================================
*/
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

/*
====================================================
EXPRESS MIDDLEWARE
====================================================
*/
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

app.use(express.json());

/*
====================================================
HEALTH CHECK
====================================================
*/
app.get("/", (req, res) => {
  res.send("Real-Time Poll API running 🚀");
});

/*
====================================================
MAKE SOCKET AVAILABLE IN ROUTES
====================================================
*/
app.use((req, res, next) => {
  req.io = io;
  next();
});

/*
====================================================
ROUTES
====================================================
*/
app.use("/api/poll", pollRoutes);

/*
====================================================
SOCKET HANDLER
====================================================
*/
setupSocket(io);

/*
====================================================
START SERVER
====================================================
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
