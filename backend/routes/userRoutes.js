const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const userController = require("../controllers/userController")

// Đăng ký người dùng mới
router.post("/register", userController.register)

// Đăng nhập
router.post("/login", userController.login)

// Lấy thông tin người dùng hiện tại
router.get("/me", auth, userController.getCurrentUser)

module.exports = router
