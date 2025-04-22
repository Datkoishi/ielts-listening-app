const express = require("express")
const cors = require("cors")
const path = require("path")
const testRoutes = require("./routes/testRoutes")
const userRoutes = require("./routes/userRoutes")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Serve static files
app.use(express.static(path.join(__dirname, "../frontend")))

// API Routes
app.use("/api/tests", testRoutes)
app.use("/api/users", userRoutes)

// Serve frontend
app.get("/teacher", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/teacher/index.html"))
})

app.get("/student", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/student/index.html"))
})

app.get("/", (req, res) => {
  res.redirect("/student")
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send("Đã xảy ra lỗi!")
})

app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`)
})
