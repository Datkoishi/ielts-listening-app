import express from "express"
import { getAllTests, getTestById, createTest, updateTest, deleteTest } from "../controllers/testController.js"
import { auth, authorize } from "../middleware/auth.js"

const router = express.Router()

// Lấy tất cả bài kiểm tra
router.get("/", auth, getAllTests)

// Lấy bài kiểm tra theo ID
router.get("/:id", auth, getTestById)

// Tạo bài kiểm tra mới (chỉ giáo viên)
router.post("/", auth, authorize("teacher"), createTest)

// Cập nhật bài kiểm tra (chỉ giáo viên)
router.put("/:id", auth, authorize("teacher"), updateTest)

// Xóa bài kiểm tra (chỉ giáo viên)
router.delete("/:id", auth, authorize("teacher"), deleteTest)

export default router

