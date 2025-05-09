/**
 * Controller cho các chức năng hệ thống
 */

const pool = require("../config/database")

// Kiểm tra kết nối database
exports.checkDatabaseConnection = async (req, res) => {
  try {
    // Lấy kết nối từ pool
    const connection = await pool.getConnection()

    // Thực hiện truy vấn đơn giản để kiểm tra kết nối
    const [result] = await connection.execute("SELECT 1 as dbConnected")

    // Trả về kết nối
    connection.release()

    // Trả về thông tin chi tiết về kết nối database
    res.json({
      success: true,
      message: "Kết nối database thành công",
      details: {
        connected: true,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        result: result[0],
      },
    })
  } catch (error) {
    console.error("Lỗi kiểm tra kết nối database:", error.message)

    // Trả về thông tin lỗi
    res.status(500).json({
      success: false,
      message: "Kết nối database thất bại",
      error: error.message,
      details: {
        connected: false,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
      },
    })
  }
}

// Kiểm tra cấu trúc database
exports.checkDatabaseStructure = async (req, res) => {
  try {
    // Lấy kết nối từ pool
    const connection = await pool.getConnection()

    // Lấy danh sách các bảng trong database
    const [tables] = await connection.execute(
      `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `,
      [process.env.DB_NAME],
    )

    // Lấy thông tin chi tiết về cấu trúc của mỗi bảng
    const tableStructures = {}

    for (const table of tables) {
      const tableName = table.table_name || table.TABLE_NAME

      // Lấy thông tin về các cột trong bảng
      const [columns] = await connection.execute(
        `
        SELECT column_name, data_type, is_nullable, column_key
        FROM information_schema.columns
        WHERE table_schema = ? AND table_name = ?
      `,
        [process.env.DB_NAME, tableName],
      )

      tableStructures[tableName] = columns
    }

    // Trả về kết nối
    connection.release()

    // Trả về thông tin về cấu trúc database
    res.json({
      success: true,
      message: "Lấy cấu trúc database thành công",
      tables: tables.map((t) => t.table_name || t.TABLE_NAME),
      structures: tableStructures,
    })
  } catch (error) {
    console.error("Lỗi kiểm tra cấu trúc database:", error.message)

    res.status(500).json({
      success: false,
      message: "Lấy cấu trúc database thất bại",
      error: error.message,
    })
  }
}

// Kiểm tra hiệu suất database
exports.checkDatabasePerformance = async (req, res) => {
  try {
    const startTime = Date.now()

    // Lấy kết nối từ pool
    const connection = await pool.getConnection()

    // Thực hiện một số truy vấn để kiểm tra hiệu suất
    await connection.execute("SELECT 1")
    await connection.execute("SHOW TABLES")

    // Trả về kết nối
    connection.release()

    const endTime = Date.now()
    const responseTime = endTime - startTime

    // Trả về thông tin về hiệu suất database
    res.json({
      success: true,
      message: "Kiểm tra hiệu suất database thành công",
      details: {
        responseTime: `${responseTime}ms`,
        status: responseTime < 500 ? "Tốt" : responseTime < 1000 ? "Trung bình" : "Kém",
      },
    })
  } catch (error) {
    console.error("Lỗi kiểm tra hiệu suất database:", error.message)

    res.status(500).json({
      success: false,
      message: "Kiểm tra hiệu suất database thất bại",
      error: error.message,
    })
  }
}

// Kiểm tra sức khỏe API
exports.checkApiHealth = (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}

// Kiểm tra CORS
exports.checkCors = (req, res) => {
  res.json({
    success: true,
    message: "CORS hoạt động bình thường",
    origin: req.headers.origin || "unknown",
  })
}
