const mongoose = require("mongoose")

const collaborationSchema = new mongoose.Schema({
  workspaceId: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ["viewer", "editor", "admin"],
    required: true,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "revoked"],
    default: "pending",
  },
  permissions: {
    read: { type: Boolean, default: true },
    write: { type: Boolean, default: false },
    execute: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
  },
  invitedAt: {
    type: Date,
    default: Date.now,
  },
  acceptedAt: {
    type: Date,
    default: null,
  },
  rejectedAt: {
    type: Date,
    default: null,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
})

// Set permissions based on role
collaborationSchema.pre("save", function (next) {
  if (this.isModified("role")) {
    switch (this.role) {
      case "viewer":
        this.permissions = { read: true, write: false, execute: false, admin: false }
        break
      case "editor":
        this.permissions = { read: true, write: true, execute: true, admin: false }
        break
      case "admin":
        this.permissions = { read: true, write: true, execute: true, admin: true }
        break
    }
  }
  next()
})

// Index for performance
collaborationSchema.index({ workspaceId: 1 })
collaborationSchema.index({ userEmail: 1 })
collaborationSchema.index({ status: 1 })

module.exports = mongoose.model("Collaboration", collaborationSchema)
