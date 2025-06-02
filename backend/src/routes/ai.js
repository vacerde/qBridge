const express = require("express")
const { body, validationResult } = require("express-validator")
const OpenAI = require("openai")
const Groq = require("groq-sdk")
const Anthropic = require("@anthropic-ai/sdk")
const logger = require("../utils/logger")

const router = express.Router()

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Validation middleware
const validateChatRequest = [
  body("message").isLength({ min: 1, max: 4000 }).trim(),
  body("provider").isIn(["openai", "groq", "anthropic", "ollama"]),
  body("model").optional().isString(),
  body("context").optional().isArray(),
]

const validateCodeRequest = [
  body("code").isLength({ min: 1, max: 10000 }),
  body("language").isString(),
  body("task").isIn(["explain", "refactor", "debug", "optimize", "complete"]),
  body("provider").optional().isIn(["openai", "groq", "anthropic"]),
]

// Chat with AI
router.post("/chat", validateChatRequest, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { message, provider, model, context = [] } = req.body
    const userId = req.user.id

    logger.info(`AI chat request from user ${userId} using ${provider}`)

    let response

    switch (provider) {
      case "openai":
        response = await handleOpenAIChat(message, model || "gpt-4", context)
        break
      case "groq":
        response = await handleGroqChat(message, model || "mixtral-8x7b-32768", context)
        break
      case "anthropic":
        response = await handleAnthropicChat(message, model || "claude-3-sonnet-20240229", context)
        break
      case "ollama":
        response = await handleOllamaChat(message, model || "llama2", context)
        break
      default:
        return res.status(400).json({ error: "Unsupported AI provider" })
    }

    res.json({
      response: response.content,
      provider,
      model: response.model,
      usage: response.usage,
    })
  } catch (error) {
    logger.error("AI chat error:", error)
    res.status(500).json({ error: "AI chat failed", message: error.message })
  }
})

// Code assistance
router.post("/code", validateCodeRequest, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { code, language, task, provider = "openai" } = req.body
    const userId = req.user.id

    logger.info(`AI code assistance request from user ${userId}: ${task} for ${language}`)

    const prompt = generateCodePrompt(code, language, task)
    let response

    switch (provider) {
      case "openai":
        response = await handleOpenAIChat(prompt, "gpt-4", [])
        break
      case "groq":
        response = await handleGroqChat(prompt, "mixtral-8x7b-32768", [])
        break
      case "anthropic":
        response = await handleAnthropicChat(prompt, "claude-3-sonnet-20240229", [])
        break
      default:
        return res.status(400).json({ error: "Unsupported AI provider for code assistance" })
    }

    res.json({
      result: response.content,
      task,
      language,
      provider,
      usage: response.usage,
    })
  } catch (error) {
    logger.error("AI code assistance error:", error)
    res.status(500).json({ error: "Code assistance failed", message: error.message })
  }
})

// AI provider handlers
async function handleOpenAIChat(message, model, context) {
  const messages = [
    { role: "system", content: "You are a helpful coding assistant for qBridge IDE." },
    ...context.map((msg) => ({ role: msg.role, content: msg.content })),
    { role: "user", content: message },
  ]

  const completion = await openai.chat.completions.create({
    model,
    messages,
    max_tokens: 2000,
    temperature: 0.7,
  })

  return {
    content: completion.choices[0].message.content,
    model: completion.model,
    usage: completion.usage,
  }
}

async function handleGroqChat(message, model, context) {
  const messages = [
    { role: "system", content: "You are a helpful coding assistant for qBridge IDE." },
    ...context.map((msg) => ({ role: msg.role, content: msg.content })),
    { role: "user", content: message },
  ]

  const completion = await groq.chat.completions.create({
    model,
    messages,
    max_tokens: 2000,
    temperature: 0.7,
  })

  return {
    content: completion.choices[0].message.content,
    model: completion.model,
    usage: completion.usage,
  }
}

async function handleAnthropicChat(message, model, context) {
  const systemMessage = "You are a helpful coding assistant for qBridge IDE."
  const userMessage =
    context.length > 0
      ? `${context.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}\n\nuser: ${message}`
      : message

  const completion = await anthropic.messages.create({
    model,
    max_tokens: 2000,
    system: systemMessage,
    messages: [{ role: "user", content: userMessage }],
  })

  return {
    content: completion.content[0].text,
    model: completion.model,
    usage: completion.usage,
  }
}

async function handleOllamaChat(message, model, context) {
  // Ollama integration - requires local Ollama server
  const axios = require("axios")

  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434"

  const response = await axios.post(`${ollamaUrl}/api/generate`, {
    model,
    prompt: message,
    stream: false,
  })

  return {
    content: response.data.response,
    model,
    usage: { total_tokens: response.data.eval_count || 0 },
  }
}

function generateCodePrompt(code, language, task) {
  const prompts = {
    explain: `Please explain the following ${language} code in detail:\n\n${code}`,
    refactor: `Please refactor the following ${language} code to improve readability and performance:\n\n${code}`,
    debug: `Please help debug the following ${language} code and identify potential issues:\n\n${code}`,
    optimize: `Please optimize the following ${language} code for better performance:\n\n${code}`,
    complete: `Please complete the following ${language} code:\n\n${code}`,
  }

  return prompts[task] || prompts.explain
}

// Get available AI models
router.get("/models", (req, res) => {
  const models = {
    openai: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
    groq: ["mixtral-8x7b-32768", "llama2-70b-4096"],
    anthropic: ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
    ollama: ["llama2", "codellama", "mistral"],
  }

  res.json(models)
})

module.exports = router
