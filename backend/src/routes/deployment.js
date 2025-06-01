const express = require("express")
const { body, param, validationResult } = require("express-validator")
const Docker = require("dockerode")
const { NodeSSH } = require("node-ssh")
const Deployment = require("../models/Deployment")
const Workspace = require("../models/Workspace")
const logger = require("../utils/logger")

const router = express.Router()
const docker = new Docker()

// Validation middleware
const validateDeployment = [
  body("workspaceId").isUUID(),
  body("name").isLength({ min: 1, max: 100 }).trim().escape(),
  body("environment").isIn(["development", "staging", "production"]),
  body("buildCommand").optional().isString(),
  body("startCommand").optional().isString(),
  body("envVars").optional().isObject(),
]

// Deploy workspace
router.post("/", validateDeployment, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { workspaceId, name, environment, buildCommand, startCommand, envVars = {} } = req.body
    const userId = req.user.id

    // Check if workspace exists and user has access
    const workspace = await Workspace.findOne({ id: workspaceId, userId })
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found or access denied" })
    }

    logger.info(`Starting deployment for workspace ${workspaceId}`)

    // Create deployment record
    const deployment = new Deployment({
      workspaceId,
      name,
      environment,
      userId,
      buildCommand,
      startCommand,
      envVars,
      status: "building",
      createdAt: new Date(),
    })

    await deployment.save()

    // Start deployment process
    deployWorkspace(deployment, workspace)

    res.status(201).json({
      message: "Deployment started",
      deploymentId: deployment._id,
      status: "building",
    })
  } catch (error) {
    logger.error("Error starting deployment:", error)
    res.status(500).json({ error: "Failed to start deployment" })
  }
})

// Get deployments for workspace
router.get("/workspace/:workspaceId", async (req, res) => {
  try {
    const { workspaceId } = req.params
    const userId = req.user.id

    // Check if user has access to workspace
    const workspace = await Workspace.findOne({ id: workspaceId, userId })
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found or access denied" })
    }

    const deployments = await Deployment.find({ workspaceId }).sort({ createdAt: -1 }).limit(20)

    res.json(deployments)
  } catch (error) {
    logger.error("Error fetching deployments:", error)
    res.status(500).json({ error: "Failed to fetch deployments" })
  }
})

// Get deployment details
router.get("/:deploymentId", async (req, res) => {
  try {
    const { deploymentId } = req.params
    const userId = req.user.id

    const deployment = await Deployment.findOne({ _id: deploymentId, userId })
    if (!deployment) {
      return res.status(404).json({ error: "Deployment not found" })
    }

    res.json(deployment)
  } catch (error) {
    logger.error("Error fetching deployment:", error)
    res.status(500).json({ error: "Failed to fetch deployment" })
  }
})

// Get deployment logs
router.get("/:deploymentId/logs", async (req, res) => {
  try {
    const { deploymentId } = req.params
    const userId = req.user.id

    const deployment = await Deployment.findOne({ _id: deploymentId, userId })
    if (!deployment) {
      return res.status(404).json({ error: "Deployment not found" })
    }

    res.json({ logs: deployment.logs || [] })
  } catch (error) {
    logger.error("Error fetching deployment logs:", error)
    res.status(500).json({ error: "Failed to fetch deployment logs" })
  }
})

// Cancel deployment
router.post("/:deploymentId/cancel", async (req, res) => {
  try {
    const { deploymentId } = req.params
    const userId = req.user.id

    const deployment = await Deployment.findOne({ _id: deploymentId, userId })
    if (!deployment) {
      return res.status(404).json({ error: "Deployment not found" })
    }

    if (!["building", "deploying"].includes(deployment.status)) {
      return res.status(400).json({ error: "Cannot cancel deployment in current status" })
    }

    deployment.status = "cancelled"
    deployment.finishedAt = new Date()
    await deployment.save()

    logger.info(`Deployment ${deploymentId} cancelled`)
    res.json({ message: "Deployment cancelled" })
  } catch (error) {
    logger.error("Error cancelling deployment:", error)
    res.status(500).json({ error: "Failed to cancel deployment" })
  }
})

// Deployment process
async function deployWorkspace(deployment, workspace) {
  try {
    // Update deployment status
    deployment.status = "building"
    deployment.logs = ["Starting deployment process..."]
    await deployment.save()

    // Get workspace container
    const container = docker.getContainer(workspace.containerId)

    // Create deployment image
    const imageName = `devforge-deploy-${deployment._id}`

    deployment.logs.push("Creating deployment image...")
    await deployment.save()

    // Commit container to image
    const image = await container.commit({
      repo: imageName,
      tag: "latest",
    })

    deployment.logs.push("Image created successfully")
    deployment.status = "deploying"
    await deployment.save()

    // Create deployment container
    const deployContainer = await docker.createContainer({
      Image: `${imageName}:latest`,
      name: `deploy-${deployment._id}`,
      Env: Object.entries(deployment.envVars).map(([key, value]) => `${key}=${value}`),
      HostConfig: {
        PortBindings: {
          "3000/tcp": [{ HostPort: "0" }], // Dynamic port assignment
        },
      },
      ExposedPorts: {
        "3000/tcp": {},
      },
    })

    // Start deployment container
    await deployContainer.start()

    // Get assigned port
    const containerInfo = await deployContainer.inspect()
    const assignedPort = containerInfo.NetworkSettings.Ports["3000/tcp"][0].HostPort

    deployment.url = `http://localhost:${assignedPort}`
    deployment.containerId = deployContainer.id
    deployment.status = "deployed"
    deployment.finishedAt = new Date()
    deployment.logs.push(`Deployment successful! Available at ${deployment.url}`)

    await deployment.save()

    logger.info(`Deployment ${deployment._id} completed successfully`)
  } catch (error) {
    logger.error(`Deployment ${deployment._id} failed:`, error)

    deployment.status = "failed"
    deployment.finishedAt = new Date()
    deployment.logs.push(`Deployment failed: ${error.message}`)
    await deployment.save()
  }
}

module.exports = router
