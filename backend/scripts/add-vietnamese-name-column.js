const { pool } = require("../config/database")

async function addVietnameseNameColumn() {
  try {
    console.log("Đang kiểm tra cột vietnamese_name...")

    // Kiểm tra xem cột vietnamese_name đã tồn tại chưa
    const [columns] = await pool.execute('SHOW COLUMNS FROM tests LIKE "vietnamese_name"')

    if (columns.length === 0) {
      console.log("Cột vietnamese_name chưa tồn tại. Đang thêm cột...")

      // Thêm cột vietnamese_name vào bảng tests
      await pool.execute("ALTER TABLE tests ADD COLUMN vietnamese_name VARCHAR(255) AFTER title")

      console.log("Đã thêm cột vietnamese_name vào bảng tests thành công.")
    } else {
      console.log("Cột vietnamese_name đã tồn tại trong bảng tests.")
    }
  } catch (error) {
    console.error("Lỗi khi thêm cột vietnamese_name:", error.message)
  } finally {
    process.exit()
  }
}

addVietnameseNameColumn()
