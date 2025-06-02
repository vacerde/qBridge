const jwt = require("jsonwebtoken")
const User = require("../models/User")
const logger = require("../utils/logger")

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Access token required" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "qBridge-jwt-secret")

    // Get user from database to ensure they still exist and are active
    const user = await User.findById(decoded.id).select("-password")
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid or expired token" })
    }

    req.user = user
    next()
  } catch (error) {
    logger.error("Authentication error:", error)
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" })
    }

    next()
  }
}

const requireAdmin = requireRole(["admin"])
const requireModerator = requireRole(["admin", "moderator"])

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireModerator,
}
