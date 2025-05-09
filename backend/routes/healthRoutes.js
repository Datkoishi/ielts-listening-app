const express = require("express")
const router = express.Router()

/**
 * @route GET /api/health
 * @desc Kiểm tra trạng thái hoạt động của API
 * @access Public
 */
router.get("/", (req, res) => {
  try {
    return res.status(200).json({
      status: "success",
      message: "API đang hoạt động bình thường",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    })
  } catch (error) {
    console.error("Lỗi khi kiểm tra sức khỏe API:", error)
    return res.status(500).json({
      status: "error",
      message: "Lỗi server khi kiểm tra sức khỏe API",
      error: error.message,
    })
  }
})

/**
 * @route GET /api/health/db
 * @desc Kiểm tra kết nối đến cơ sở dữ liệu
 * @access Public
 */
router.get("/db", async (req, res) => {
  try {
    // Kiểm tra kết nối đến cơ sở dữ liệu
    // Đây là ví dụ, bạn cần thay thế bằng cách kiểm tra thực tế
    const dbConnection = require("../config/database")

    // Thực hiện truy vấn đơn giản để kiểm tra kết nối
    const result = await dbConnection.query("SELECT 1 as test")

    return res.status(200).json({
      status: "success",
      message: "Kết nối đến cơ sở dữ liệu thành công",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Lỗi khi kiểm tra kết nối cơ sở dữ liệu:", error)
    return res.status(500).json({
      status: "error",
      message: "Không thể kết nối đến cơ sở dữ liệu",
      error: error.message,
    })
  }
})

/**
 * @route GET /api/health/cors-test
 * @desc Kiểm tra cấu hình CORS
 * @access Public
 */
router.get("/cors-test", (req, res) => {
  // Trả về header CORS để kiểm tra
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")

  return res.status(200).json({
    status: "success",
    message: "Kiểm tra CORS thành công",
    origin: req.headers.origin || "unknown",
    headers: {
      "Access-Control-Allow-Origin": res.getHeader("Access-Control-Allow-Origin"),
      "Access-Control-Allow-Methods": res.getHeader("Access-Control-Allow-Methods"),
      "Access-Control-Allow-Headers": res.getHeader("Access-Control-Allow-Headers"),
    },
  })
})

module.exports = router
