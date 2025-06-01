const express = require("express")
const { body, param, validationResult } = require("express-validator")
const Collaboration = require("../models/Collaboration")
const Workspace = require("../models/Workspace")
const logger = require("../utils/logger")

const router = express.Router()

// Validation middleware
const validateInviteUser = [
  body("workspaceId").isUUID(),
  body("email").isEmail().normalizeEmail(),
  body("role").isIn(["viewer", "editor", "admin"]),
]

// Invite user to workspace
router.post("/invite", validateInviteUser, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { workspaceId, email, role } = req.body
    const inviterId = req.user.id

    // Check if workspace exists and user has permission
    const workspace = await Workspace.findOne({ id: workspaceId, userId: inviterId })
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found or access denied" })
    }

    // Check if collaboration already exists
    const existingCollaboration = await Collaboration.findOne({ workspaceId, userEmail: email })
    if (existingCollaboration) {
      return res.status(400).json({ error: "User already has access to this workspace" })
    }

    // Create collaboration record
    const collaboration = new Collaboration({
      workspaceId,
      userEmail: email,
      role,
      invitedBy: inviterId,
      status: "pending",
      invitedAt: new Date(),
    })

    await collaboration.save()

    logger.info(`User ${email} invited to workspace ${workspaceId} by ${inviterId}`)
    res.status(201).json({ message: "Invitation sent successfully", collaboration })
  } catch (error) {
    logger.error("Error inviting user:", error)
    res.status(500).json({ error: "Failed to send invitation" })
  }
})

// Get workspace collaborators
router.get("/workspace/:workspaceId", async (req, res) => {
  try {
    const { workspaceId } = req.params
    const userId = req.user.id

    // Check if user has access to workspace
    const workspace = await Workspace.findOne({ id: workspaceId, userId })
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found or access denied" })
    }

    const collaborations = await Collaboration.find({ workspaceId })
      .populate("invitedBy", "username email firstName lastName")
      .sort({ invitedAt: -1 })

    res.json(collaborations)
  } catch (error) {
    logger.error("Error fetching collaborators:", error)
    res.status(500).json({ error: "Failed to fetch collaborators" })
  }
})

// Accept collaboration invitation
router.post("/accept/:collaborationId", async (req, res) => {
  try {
    const { collaborationId } = req.params
    const userEmail = req.user.email

    const collaboration = await Collaboration.findById(collaborationId)
    if (!collaboration) {
      return res.status(404).json({ error: "Invitation not found" })
    }

    if (collaboration.userEmail !== userEmail) {
      return res.status(403).json({ error: "This invitation is not for you" })
    }

    if (collaboration.status !== "pending") {
      return res.status(400).json({ error: "Invitation already processed" })
    }

    collaboration.status = "accepted"
    collaboration.acceptedAt = new Date()
    await collaboration.save()

    logger.info(`Collaboration invitation ${collaborationId} accepted by ${userEmail}`)
    res.json({ message: "Invitation accepted successfully" })
  } catch (error) {
    logger.error("Error accepting invitation:", error)
    res.status(500).json({ error: "Failed to accept invitation" })
  }
})

// Reject collaboration invitation
router.post("/reject/:collaborationId", async (req, res) => {
  try {
    const { collaborationId } = req.params
    const userEmail = req.user.email

    const collaboration = await Collaboration.findById(collaborationId)
    if (!collaboration) {
      return res.status(404).json({ error: "Invitation not found" })
    }

    if (collaboration.userEmail !== userEmail) {
      return res.status(403).json({ error: "This invitation is not for you" })
    }

    if (collaboration.status !== "pending") {
      return res.status(400).json({ error: "Invitation already processed" })
    }

    collaboration.status = "rejected"
    collaboration.rejectedAt = new Date()
    await collaboration.save()

    logger.info(`Collaboration invitation ${collaborationId} rejected by ${userEmail}`)
    res.json({ message: "Invitation rejected" })
  } catch (error) {
    logger.error("Error rejecting invitation:", error)
    res.status(500).json({ error: "Failed to reject invitation" })
  }
})

// Remove collaborator
router.delete("/workspace/:workspaceId/user/:email", async (req, res) => {
  try {
    const { workspaceId, email } = req.params
    const userId = req.user.id

    // Check if user has permission to remove collaborators
    const workspace = await Workspace.findOne({ id: workspaceId, userId })
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found or access denied" })
    }

    const collaboration = await Collaboration.findOneAndDelete({
      workspaceId,
      userEmail: email,
    })

    if (!collaboration) {
      return res.status(404).json({ error: "Collaborator not found" })
    }

    logger.info(`Collaborator ${email} removed from workspace ${workspaceId}`)
    res.json({ message: "Collaborator removed successfully" })
  } catch (error) {
    logger.error("Error removing collaborator:", error)
    res.status(500).json({ error: "Failed to remove collaborator" })
  }
})

// Get user's collaboration invitations
router.get("/invitations", async (req, res) => {
  try {
    const userEmail = req.user.email

    const invitations = await Collaboration.find({
      userEmail,
      status: "pending",
    })
      .populate("invitedBy", "username email firstName lastName")
      .sort({ invitedAt: -1 })

    res.json(invitations)
  } catch (error) {
    logger.error("Error fetching invitations:", error)
    res.status(500).json({ error: "Failed to fetch invitations" })
  }
})

module.exports = router
