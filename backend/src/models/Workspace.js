const mongoose = require("mongoose")

const workspaceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  template: {
    type: String,
    required: true,
    enum: ["next", "node", "python", "rust", "react", "vue", "angular"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  containerId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["creating", "running", "stopped", "error", "deleted"],
    default: "creating",
  },
  url: {
    type: String,
    required: true,
  },
  port: {
    type: Number,
    required: true,
  },
  resources: {
    memory: {
      type: Number,
      default: 2048, // MB
    },
    cpu: {
      type: Number,
      default: 1024, // CPU shares
    },
    storage: {
      type: Number,
      default: 10240, // MB
    },
  },
  settings: {
    autoSleep: {
      type: Boolean,
      default: true,
    },
    sleepAfter: {
      type: Number,
      default: 30, // minutes
    },
    publicAccess: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field before saving
workspaceSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Index for performance
workspaceSchema.index({ userId: 1 })
workspaceSchema.index({ id: 1 })
workspaceSchema.index({ status: 1 })

module.exports = mongoose.model("Workspace", workspaceSchema)
