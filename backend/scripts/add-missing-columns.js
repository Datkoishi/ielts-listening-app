const { pool } = require("../config/database")

async function addMissingColumns() {
  try {
    console.log("Đang kiểm tra và thêm các cột còn thiếu vào bảng tests...")

    // Lấy thông tin về cấu trúc bảng tests
    const [columns] = await pool.execute("SHOW COLUMNS FROM tests")
    const existingColumns = columns.map((col) => col.Field)

    // Kiểm tra và thêm cột vietnamese_name
    if (!existingColumns.includes("vietnamese_name")) {
      console.log("Đang thêm cột vietnamese_name...")
      await pool.execute("ALTER TABLE tests ADD COLUMN vietnamese_name VARCHAR(255) DEFAULT ''")
      console.log("Đã thêm cột vietnamese_name thành công!")
    } else {
      console.log("Cột vietnamese_name đã tồn tại.")
    }

    // Kiểm tra và thêm cột description
    if (!existingColumns.includes("description")) {
      console.log("Đang thêm cột description...")
      await pool.execute("ALTER TABLE tests ADD COLUMN description TEXT")
      console.log("Đã thêm cột description thành công!")
    } else {
      console.log("Cột description đã tồn tại.")
    }

    console.log("Hoàn tất kiểm tra và thêm các cột còn thiếu!")
  } catch (error) {
    console.error("Lỗi khi thêm cột:", error.message)
  } finally {
    pool.end()
    process.exit()
  }
}

addMissingColumns()
