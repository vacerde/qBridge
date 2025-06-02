const Docker = require("dockerode")
const logger = require("../utils/logger")

const docker = new Docker()

const initializeDocker = async () => {
  try {
    // Test Docker connection
    const info = await docker.info()
    logger.info("Docker connection established:", {
      version: info.ServerVersion,
      containers: info.Containers,
      images: info.Images,
    })

    // Pull required base images
    const baseImages = ["codercom/code-server:latest", "node:18-alpine", "python:3.11-alpine", "rust:1.70-alpine"]

    for (const image of baseImages) {
      try {
        logger.info(`Pulling image: ${image}`)
        await docker.pull(image)
        logger.info(`Successfully pulled: ${image}`)
      } catch (error) {
        logger.warn(`Failed to pull ${image}:`, error.message)
      }
    }

    // Clean up old containers
    await cleanupOldContainers()

    return docker
  } catch (error) {
    logger.error("Failed to initialize Docker:", error)
    throw error
  }
}

const cleanupOldContainers = async () => {
  try {
    const containers = await docker.listContainers({
      all: true,
      filters: { label: ["service=qBridge-workspace"] },
    })

    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    for (const containerInfo of containers) {
      const created = new Date(containerInfo.Created * 1000)
      const age = now - created.getTime()

      if (age > maxAge && containerInfo.State === "exited") {
        try {
          const container = docker.getContainer(containerInfo.Id)
          await container.remove()
          logger.info(`Cleaned up old container: ${containerInfo.Names[0]}`)
        } catch (error) {
          logger.warn(`Failed to cleanup container ${containerInfo.Id}:`, error.message)
        }
      }
    }
  } catch (error) {
    logger.error("Error during container cleanup:", error)
  }
}

const getContainerStats = async (containerId) => {
  try {
    const container = docker.getContainer(containerId)
    const stats = await container.stats({ stream: false })

    return {
      cpu: calculateCpuPercent(stats),
      memory: {
        used: stats.memory_stats.usage,
        limit: stats.memory_stats.limit,
        percent: (stats.memory_stats.usage / stats.memory_stats.limit) * 100,
      },
      network: stats.networks,
      timestamp: new Date(),
    }
  } catch (error) {
    logger.error(`Error getting stats for container ${containerId}:`, error)
    return null
  }
}

const calculateCpuPercent = (stats) => {
  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage
  const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage
  const numberCpus = stats.cpu_stats.online_cpus

  if (systemDelta > 0 && cpuDelta > 0) {
    return (cpuDelta / systemDelta) * numberCpus * 100
  }
  return 0
}

module.exports = {
  docker,
  initializeDocker,
  cleanupOldContainers,
  getContainerStats,
}
