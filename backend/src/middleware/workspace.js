const Workspace = require("../models/Workspace")
const Collaboration = require("../models/Collaboration")
const logger = require("../utils/logger")

const validateWorkspaceAccess = async (req, res, next) => {
  try {
    const workspaceId = req.params.id
    const userId = req.user.id
    const userEmail = req.user.email

    // Check if user owns the workspace
    let workspace = await Workspace.findOne({ id: workspaceId, userId })

    if (!workspace) {
      // Check if user has collaboration access
      const collaboration = await Collaboration.findOne({
        workspaceId,
        userEmail,
        status: "accepted",
      })

      if (!collaboration) {
        return res.status(404).json({ error: "Workspace not found or access denied" })
      }

      // Get workspace for collaborator
      workspace = await Workspace.findOne({ id: workspaceId })
      if (!workspace) {
        return res.status(404).json({ error: "Workspace not found" })
      }

      // Add collaboration info to request
      req.collaboration = collaboration
    }

    req.workspace = workspace
    next()
  } catch (error) {
    logger.error("Workspace access validation error:", error)
    res.status(500).json({ error: "Failed to validate workspace access" })
  }
}

const requireWorkspacePermission = (permission) => {
  return (req, res, next) => {
    const workspace = req.workspace
    const collaboration = req.collaboration
    const userId = req.user.id

    // Owner has all permissions
    if (workspace.userId.toString() === userId.toString()) {
      return next()
    }

    // Check collaboration permissions
    if (!collaboration || !collaboration.permissions[permission]) {
      return res.status(403).json({ error: "Insufficient permissions for this action" })
    }

    next()
  }
}

module.exports = {
  validateWorkspaceAccess,
  requireWorkspacePermission,
}
