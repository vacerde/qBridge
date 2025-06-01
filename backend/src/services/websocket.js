const jwt = require("jsonwebtoken")
const User = require("../models/User")
const Workspace = require("../models/Workspace")
const logger = require("../utils/logger")

const connectedUsers = new Map() // userId -> socket
const workspaceUsers = new Map() // workspaceId -> Set of userIds

const setupWebSocket = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error("Authentication error"))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "devforge-jwt-secret")
      const user = await User.findById(decoded.id).select("-password")

      if (!user || !user.isActive) {
        return next(new Error("Authentication error"))
      }

      socket.user = user
      next()
    } catch (error) {
      logger.error("Socket authentication error:", error)
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString()
    logger.info(`User ${socket.user.username} connected via WebSocket`)

    // Store user connection
    connectedUsers.set(userId, socket)

    // Handle joining workspace
    socket.on("join-workspace", async (workspaceId) => {
      try {
        // Validate workspace access
        const workspace = await Workspace.findOne({
          id: workspaceId,
          userId: socket.user._id,
        })

        if (!workspace) {
          socket.emit("error", { message: "Workspace not found or access denied" })
          return
        }

        // Join workspace room
        socket.join(`workspace-${workspaceId}`)

        // Track users in workspace
        if (!workspaceUsers.has(workspaceId)) {
          workspaceUsers.set(workspaceId, new Set())
        }
        workspaceUsers.get(workspaceId).add(userId)

        // Notify other users in workspace
        socket.to(`workspace-${workspaceId}`).emit("user-joined", {
          userId,
          username: socket.user.username,
          timestamp: new Date(),
        })

        // Send current workspace users to the joining user
        const currentUsers = Array.from(workspaceUsers.get(workspaceId))
          .filter((id) => id !== userId)
          .map((id) => {
            const userSocket = connectedUsers.get(id)
            return userSocket
              ? {
                  userId: id,
                  username: userSocket.user.username,
                }
              : null
          })
          .filter((user) => user !== null)

        socket.emit("workspace-users", currentUsers)

        logger.info(`User ${socket.user.username} joined workspace ${workspaceId}`)
      } catch (error) {
        logger.error("Error joining workspace:", error)
        socket.emit("error", { message: "Failed to join workspace" })
      }
    })

    // Handle leaving workspace
    socket.on("leave-workspace", (workspaceId) => {
      socket.leave(`workspace-${workspaceId}`)

      if (workspaceUsers.has(workspaceId)) {
        workspaceUsers.get(workspaceId).delete(userId)

        // Clean up empty workspace
        if (workspaceUsers.get(workspaceId).size === 0) {
          workspaceUsers.delete(workspaceId)
        }
      }

      // Notify other users
      socket.to(`workspace-${workspaceId}`).emit("user-left", {
        userId,
        username: socket.user.username,
        timestamp: new Date(),
      })

      logger.info(`User ${socket.user.username} left workspace ${workspaceId}`)
    })

    // Handle real-time code editing
    socket.on("code-change", (data) => {
      const { workspaceId, file, changes, cursor } = data

      // Broadcast changes to other users in the workspace
      socket.to(`workspace-${workspaceId}`).emit("code-change", {
        userId,
        username: socket.user.username,
        file,
        changes,
        cursor,
        timestamp: new Date(),
      })
    })

    // Handle cursor position updates
    socket.on("cursor-update", (data) => {
      const { workspaceId, file, position } = data

      socket.to(`workspace-${workspaceId}`).emit("cursor-update", {
        userId,
        username: socket.user.username,
        file,
        position,
        timestamp: new Date(),
      })
    })

    // Handle file operations
    socket.on("file-operation", (data) => {
      const { workspaceId, operation, file, content } = data

      socket.to(`workspace-${workspaceId}`).emit("file-operation", {
        userId,
        username: socket.user.username,
        operation, // 'create', 'delete', 'rename', 'move'
        file,
        content,
        timestamp: new Date(),
      })
    })

    // Handle terminal sharing
    socket.on("terminal-input", (data) => {
      const { workspaceId, command } = data

      socket.to(`workspace-${workspaceId}`).emit("terminal-input", {
        userId,
        username: socket.user.username,
        command,
        timestamp: new Date(),
      })
    })

    socket.on("terminal-output", (data) => {
      const { workspaceId, output } = data

      socket.to(`workspace-${workspaceId}`).emit("terminal-output", {
        userId,
        username: socket.user.username,
        output,
        timestamp: new Date(),
      })
    })

    // Handle chat messages
    socket.on("chat-message", (data) => {
      const { workspaceId, message } = data

      io.to(`workspace-${workspaceId}`).emit("chat-message", {
        userId,
        username: socket.user.username,
        message,
        timestamp: new Date(),
      })
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      logger.info(`User ${socket.user.username} disconnected`)

      // Remove from connected users
      connectedUsers.delete(userId)

      // Remove from all workspaces
      for (const [workspaceId, users] of workspaceUsers.entries()) {
        if (users.has(userId)) {
          users.delete(userId)

          // Notify other users
          socket.to(`workspace-${workspaceId}`).emit("user-left", {
            userId,
            username: socket.user.username,
            timestamp: new Date(),
          })

          // Clean up empty workspace
          if (users.size === 0) {
            workspaceUsers.delete(workspaceId)
          }
        }
      }
    })
  })

  return io
}

module.exports = { setupWebSocket }
