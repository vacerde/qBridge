const express = require("express")
const { body, param, validationResult } = require("express-validator")
const { v4: uuidv4 } = require("uuid")
const Docker = require("dockerode")
const Workspace = require("../models/Workspace")
const logger = require("../utils/logger")
const { validateWorkspaceAccess } = require("../middleware/workspace")

const router = express.Router()
const docker = new Docker()

// Validation middleware
const validateCreateWorkspace = [
  body("name").isLength({ min: 1, max: 100 }).trim().escape(),
  body("template").isIn(["next", "node", "python", "rust", "react", "vue", "angular"]),
  body("description").optional().isLength({ max: 500 }).trim().escape(),
]

const validateWorkspaceId = [param("id").isUUID().withMessage("Invalid workspace ID")]

// Get template configuration
function getTemplateConfig(template) {
  const configs = {
    next: {
      image: "codercom/code-server:latest",
      env: ["NEXT_TELEMETRY_DISABLED=1"],
      ports: { "8080/tcp": {} },
      workingDir: "/home/coder/project",
    },
    node: {
      image: "codercom/code-server:latest",
      env: ["NODE_ENV=development"],
      ports: { "8080/tcp": {} },
      workingDir: "/home/coder/project",
    },
    python: {
      image: "codercom/code-server:latest",
      env: ["PYTHONPATH=/home/coder/project"],
      ports: { "8080/tcp": {} },
      workingDir: "/home/coder/project",
    },
    rust: {
      image: "codercom/code-server:latest",
      env: ["CARGO_HOME=/home/coder/.cargo"],
      ports: { "8080/tcp": {} },
      workingDir: "/home/coder/project",
    },
    react: {
      image: "codercom/code-server:latest",
      env: ["FAST_REFRESH=true"],
      ports: { "8080/tcp": {} },
      workingDir: "/home/coder/project",
    },
    vue: {
      image: "codercom/code-server:latest",
      env: ["VUE_CLI_TELEMETRY_DISABLED=1"],
      ports: { "8080/tcp": {} },
      workingDir: "/home/coder/project",
    },
    angular: {
      image: "codercom/code-server:latest",
      env: ["NG_CLI_ANALYTICS=false"],
      ports: { "8080/tcp": {} },
      workingDir: "/home/coder/project",
    },
  }

  return configs[template] || configs.node
}

// Create workspace
router.post("/", validateCreateWorkspace, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, template, description } = req.body
    const userId = req.user.id
    const workspaceId = uuidv4()

    logger.info(`Creating workspace ${workspaceId} for user ${userId}`)

    // Get template configuration
    const config = getTemplateConfig(template)

    // Create workspace directory
    const workspaceDir = `/workspace-data/${workspaceId}`

    // Pull Docker image if needed
    try {
      await docker.pull(config.image)
    } catch (pullError) {
      logger.warn(`Failed to pull image ${config.image}:`, pullError.message)
    }

    // Create container
    const containerName = `workspace-${workspaceId}`
    const container = await docker.createContainer({
      name: containerName,
      Image: config.image,
      Env: [...config.env, `WORKSPACE_ID=${workspaceId}`, `USER_ID=${userId}`, "PASSWORD=qBridge123"],
      Labels: {
        service: "qBridge-workspace",
        "workspace.id": workspaceId,
        "workspace.name": name,
        "workspace.template": template,
        "workspace.user_id": userId,
      },
      HostConfig: {
        Binds: [`${workspaceDir}:${config.workingDir}`],
        PortBindings: {
          "8080/tcp": [{ HostPort: "0" }], // Dynamic port assignment
        },
        Memory: 2 * 1024 * 1024 * 1024, // 2GB memory limit
        CpuShares: 1024,
      },
      ExposedPorts: config.ports,
      WorkingDir: config.workingDir,
    })

    // Start container
    await container.start()

    // Get container info to retrieve assigned port
    const containerInfo = await container.inspect()
    const assignedPort = containerInfo.NetworkSettings.Ports["8080/tcp"][0].HostPort

    // Save workspace to database
    const workspace = new Workspace({
      id: workspaceId,
      name,
      description,
      template,
      userId,
      containerId: container.id,
      status: "running",
      url: `http://localhost:${assignedPort}`,
      port: Number.parseInt(assignedPort),
      createdAt: new Date(),
      lastAccessedAt: new Date(),
    })

    await workspace.save()

    logger.info(`Workspace ${workspaceId} created successfully`)
    res.status(201).json(workspace)
  } catch (error) {
    logger.error("Error creating workspace:", error)
    res.status(500).json({ error: "Failed to create workspace", message: error.message })
  }
})

// Get all workspaces for user
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id
    const workspaces = await Workspace.find({ userId }).sort({ lastAccessedAt: -1 })

    // Update status from Docker
    for (const workspace of workspaces) {
      try {
        const container = docker.getContainer(workspace.containerId)
        const containerInfo = await container.inspect()
        workspace.status = containerInfo.State.Status
      } catch (error) {
        workspace.status = "error"
      }
    }

    res.json(workspaces)
  } catch (error) {
    logger.error("Error fetching workspaces:", error)
    res.status(500).json({ error: "Failed to fetch workspaces" })
  }
})

// Get specific workspace
router.get("/:id", validateWorkspaceId, validateWorkspaceAccess, async (req, res) => {
  try {
    const workspace = req.workspace

    // Update last accessed time
    workspace.lastAccessedAt = new Date()
    await workspace.save()

    res.json(workspace)
  } catch (error) {
    logger.error("Error fetching workspace:", error)
    res.status(500).json({ error: "Failed to fetch workspace" })
  }
})

// Start workspace
router.post("/:id/start", validateWorkspaceId, validateWorkspaceAccess, async (req, res) => {
  try {
    const workspace = req.workspace
    const container = docker.getContainer(workspace.containerId)

    await container.start()
    workspace.status = "running"
    workspace.lastAccessedAt = new Date()
    await workspace.save()

    logger.info(`Workspace ${workspace.id} started`)
    res.json({ message: "Workspace started successfully" })
  } catch (error) {
    logger.error("Error starting workspace:", error)
    res.status(500).json({ error: "Failed to start workspace" })
  }
})

// Stop workspace
router.post("/:id/stop", validateWorkspaceId, validateWorkspaceAccess, async (req, res) => {
  try {
    const workspace = req.workspace
    const container = docker.getContainer(workspace.containerId)

    await container.stop()
    workspace.status = "stopped"
    await workspace.save()

    logger.info(`Workspace ${workspace.id} stopped`)
    res.json({ message: "Workspace stopped successfully" })
  } catch (error) {
    logger.error("Error stopping workspace:", error)
    res.status(500).json({ error: "Failed to stop workspace" })
  }
})

// Delete workspace
router.delete("/:id", validateWorkspaceId, validateWorkspaceAccess, async (req, res) => {
  try {
    const workspace = req.workspace
    const container = docker.getContainer(workspace.containerId)

    // Stop and remove container
    try {
      await container.stop()
    } catch (error) {
      // Container might already be stopped
    }

    await container.remove()

    // Remove workspace from database
    await Workspace.findByIdAndDelete(workspace._id)

    logger.info(`Workspace ${workspace.id} deleted`)
    res.json({ message: "Workspace deleted successfully" })
  } catch (error) {
    logger.error("Error deleting workspace:", error)
    res.status(500).json({ error: "Failed to delete workspace" })
  }
})

// Get workspace logs
router.get("/:id/logs", validateWorkspaceId, validateWorkspaceAccess, async (req, res) => {
  try {
    const workspace = req.workspace
    const container = docker.getContainer(workspace.containerId)

    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail: 100,
      timestamps: true,
    })

    res.json({ logs: logs.toString() })
  } catch (error) {
    logger.error("Error fetching workspace logs:", error)
    res.status(500).json({ error: "Failed to fetch workspace logs" })
  }
})

module.exports = router
