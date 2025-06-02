const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const rateLimit = require("express-rate-limit")
const session = require("express-session")
const RedisStore = require("connect-redis").default
const redis = require("redis")
const mongoose = require("mongoose")
const { execSync } = require("child_process")
const net = require("net")
require("dotenv").config()

const logger = require("./utils/logger")
const authRoutes = require("./routes/auth")
const workspaceRoutes = require("./routes/workspaces")
const aiRoutes = require("./routes/ai")
const collaborationRoutes = require("./routes/collaboration")
const deploymentRoutes = require("./routes/deployment")
const { authenticateToken } = require("./middleware/auth")
const { setupWebSocket } = require("./services/websocket")
const { initializeDocker } = require("./services/docker")

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

const PORT = process.env.PORT || 9000
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/qBridge"
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

const redisClient = redis.createClient({ url: REDIS_URL })
redisClient.connect().catch(console.error)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
})

app.use(helmet())
app.use(compression())
app.use(limiter)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "qBridge-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
)

app.use("/api/auth", authRoutes)
app.use("/api/workspaces", authenticateToken, workspaceRoutes)
app.use("/api/ai", authenticateToken, aiRoutes)
app.use("/api/collaboration", authenticateToken, collaborationRoutes)
app.use("/api/deployment", authenticateToken, deploymentRoutes)

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  })
})

app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

function isPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once("error", () => resolve(true))
      .once("listening", () => {
        tester.close(() => resolve(false))
      })
      .listen(port)
  })
}

async function freePortIfNeeded(port) {
  if (await isPortInUse(port)) {
    try {
      const pid = execSync(`lsof -ti tcp:${port}`).toString().trim()
      if (pid) {
        logger.warn(`Port ${port} is in use. Killing process ${pid}`)
        execSync(`kill -9 ${pid}`)
      }
    } catch (err) {
      logger.error(`Failed to free port ${port}: ${err.message}`)
      process.exit(1)
    }
  }
}

async function startServer() {
  try {
    await freePortIfNeeded(PORT)

    await mongoose.connect(MONGODB_URI)
    logger.info("Connected to MongoDB")

    await initializeDocker()
    logger.info("Docker service initialized")

    setupWebSocket(io)
    logger.info("WebSocket service initialized")

    server.listen(PORT, "0.0.0.0", () => {
      logger.info(`qBridge backend server running on port ${PORT}`)
    })
  } catch (error) {
    logger.error("Failed to start server:", error)
    process.exit(1)
  }
}

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully")
  server.close(() => {
    mongoose.connection.close()
    redisClient.quit()
    process.exit(0)
  })
})

startServer()

module.exports = { app, server, io }