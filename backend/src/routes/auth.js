const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const logger = require("../utils/logger")

const router = express.Router()

// Validation middleware
const validateRegister = [
  body("username").isLength({ min: 3, max: 30 }).trim().escape(),
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body("firstName").isLength({ min: 1, max: 50 }).trim().escape(),
  body("lastName").isLength({ min: 1, max: 50 }).trim().escape(),
]

const validateLogin = [body("email").isEmail().normalizeEmail(), body("password").isLength({ min: 1 })]

// Register
router.post("/register", validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password, firstName, lastName } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists with this email or username",
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "user",
      isActive: true,
      createdAt: new Date(),
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "qBridge-jwt-secret",
      { expiresIn: "24h" },
    )

    logger.info(`User registered: ${email}`)

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    })
  } catch (error) {
    logger.error("Registration error:", error)
    res.status(500).json({ error: "Registration failed" })
  }
})

// Login
router.post("/login", validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: "Account is deactivated" })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Update last login
    user.lastLoginAt = new Date()
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "qBridge-jwt-secret",
      { expiresIn: "24h" },
    )

    logger.info(`User logged in: ${email}`)

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    })
  } catch (error) {
    logger.error("Login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

// Get current user profile
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "qBridge-jwt-secret")
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    logger.error("Profile fetch error:", error)
    res.status(401).json({ error: "Invalid token" })
  }
})

// Logout
router.post("/logout", (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // Here we could implement token blacklisting if needed
  res.json({ message: "Logged out successfully" })
})

module.exports = router
