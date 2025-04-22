const express = require("express")
const path = require("path")
const cors = require("cors")
const testRoutes = require("./routes/testRoutes")
const userRoutes = require("./routes/userRoutes")
const { authenticateToken } = require("./middleware/auth")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files
app.use(express.static(path.join(__dirname, "../frontend")))

// API Routes
app.use("/api/tests", testRoutes)
app.use("/api/users", authenticateToken, userRoutes)

// Serve teacher interface
app.get("/teacher", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/teacher/index.html"))
})

// Serve student interface
app.get("/student", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/student/index.html"))
})

// Default route
app.get("/", (req, res) => {
  res.redirect("/student")
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Lỗi máy chủ", error: err.message })
})

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`)
})
