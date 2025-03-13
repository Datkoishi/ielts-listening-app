import express from "express"
import { register, login, getCurrentUser } from "../controllers/userController.js"
import { auth } from "../middleware/auth.js"

const router = express.Router()

// Đăng ký người dùng mới
router.post("/register", register)

// Đăng nhập
router.post("/login", login)

// Lấy thông tin người dùng hiện tại
router.get("/me", auth, getCurrentUser)

export default router

