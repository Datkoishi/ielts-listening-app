const express = require("express")
const cors = require("cors")
const path = require("path")
const testRoutes = require("./routes/testRoutes")
const userRoutes = require("./routes/userRoutes")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files
app.use(express.static(path.join(__dirname, "../frontend/teacher")))
app.use("/student", express.static(path.join(__dirname, "../frontend/student")))

// API routes
app.use("/api/tests", testRoutes)
app.use("/api/users", userRoutes)

// Serve teacher frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/teacher/index.html"))
})

// Serve student frontend
app.get("/student", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/student/index.html"))
})

app.get("/student/test", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/student/test.html"))
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
