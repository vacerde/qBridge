const mongoose = require("mongoose")

const deploymentSchema = new mongoose.Schema({
  workspaceId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  environment: {
    type: String,
    enum: ["development", "staging", "production"],
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  containerId: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["building", "deploying", "deployed", "failed", "cancelled"],
    default: "building",
  },
  url: {
    type: String,
    default: null,
  },
  buildCommand: {
    type: String,
    default: "npm run build",
  },
  startCommand: {
    type: String,
    default: "npm start",
  },
  envVars: {
    type: Map,
    of: String,
    default: new Map(),
  },
  logs: [
    {
      type: String,
    },
  ],
  buildTime: {
    type: Number, // seconds
    default: null,
  },
  deployTime: {
    type: Number, // seconds
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startedAt: {
    type: Date,
    default: null,
  },
  finishedAt: {
    type: Date,
    default: null,
  },
})

// Calculate build and deploy times
deploymentSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const now = new Date()

    if (this.status === "building" && !this.startedAt) {
      this.startedAt = now
    }

    if (["deployed", "failed", "cancelled"].includes(this.status) && !this.finishedAt) {
      this.finishedAt = now

      if (this.startedAt) {
        this.deployTime = Math.floor((now - this.startedAt) / 1000)
      }
    }
  }
  next()
})

// Index for performance
deploymentSchema.index({ workspaceId: 1 })
deploymentSchema.index({ userId: 1 })
deploymentSchema.index({ status: 1 })
deploymentSchema.index({ createdAt: -1 })

module.exports = mongoose.model("Deployment", deploymentSchema)
