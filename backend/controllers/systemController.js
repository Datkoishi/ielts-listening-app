const db = require("../config/database")

// Kiểm tra kết nối database
exports.checkDatabaseConnection = async (req, res) => {
  try {
    // Thử kết nối đến database
    await db.query("SELECT 1")

    return res.status(200).json({
      success: true,
      message: "Kết nối đến database thành công",
      details: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
      },
    })
  } catch (error) {
    console.error("Lỗi kết nối database:", error)

    return res.status(500).json({
      success: false,
      message: "Không thể kết nối đến database",
      error: error.message,
      details: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
      },
    })
  }
}

// Kiểm tra cấu trúc database
exports.checkDatabaseStructure = async (req, res) => {
  try {
    // Kiểm tra các bảng cần thiết
    const tables = ["tests", "users", "audio_files"]
    const results = {}

    for (const table of tables) {
      try {
        await db.query(`SELECT 1 FROM ${table} LIMIT 1`)
        results[table] = true
      } catch (error) {
        results[table] = false
      }
    }

    const allTablesExist = Object.values(results).every((result) => result === true)

    return res.status(200).json({
      success: allTablesExist,
      message: allTablesExist ? "Tất cả các bảng đều tồn tại" : "Một số bảng không tồn tại",
      details: results,
    })
  } catch (error) {
    console.error("Lỗi kiểm tra cấu trúc database:", error)

    return res.status(500).json({
      success: false,
      message: "Không thể kiểm tra cấu trúc database",
      error: error.message,
    })
  }
}

// Kiểm tra hiệu suất database
exports.checkDatabasePerformance = async (req, res) => {
  try {
    const startTime = Date.now()

    // Thực hiện một truy vấn đơn giản
    await db.query("SELECT 1")

    const endTime = Date.now()
    const responseTime = endTime - startTime

    let performance = "Tốt"
    if (responseTime > 500) {
      performance = "Trung bình"
    }
    if (responseTime > 1000) {
      performance = "Kém"
    }

    return res.status(200).json({
      success: true,
      message: `Hiệu suất database: ${performance}`,
      details: {
        responseTime: `${responseTime}ms`,
        performance,
      },
    })
  } catch (error) {
    console.error("Lỗi kiểm tra hiệu suất database:", error)

    return res.status(500).json({
      success: false,
      message: "Không thể kiểm tra hiệu suất database",
      error: error.message,
    })
  }
}

// Kiểm tra sức khỏe API
exports.checkApiHealth = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API đang hoạt động",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
}

// Kiểm tra CORS
exports.checkCors = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "CORS đang hoạt động đúng",
    origin: req.headers.origin || "Unknown",
  })
}
