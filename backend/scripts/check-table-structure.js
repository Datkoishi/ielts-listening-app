const { pool } = require("../config/database")

async function checkTableStructure() {
  try {
    console.log("Đang kiểm tra cấu trúc bảng tests...")

    // Lấy thông tin về cấu trúc bảng tests
    const [columns] = await pool.execute("SHOW COLUMNS FROM tests")

    console.log("Cấu trúc bảng tests:")
    columns.forEach((column) => {
      console.log(
        `- ${column.Field}: ${column.Type} ${column.Null === "NO" ? "NOT NULL" : ""} ${column.Key === "PRI" ? "PRIMARY KEY" : ""}`,
      )
    })

    // Kiểm tra xem cột vietnamese_name có tồn tại không
    const hasVietnameseName = columns.some((column) => column.Field === "vietnamese_name")

    if (hasVietnameseName) {
      console.log("\nCột vietnamese_name đã tồn tại trong bảng tests.")
    } else {
      console.log("\nCột vietnamese_name KHÔNG tồn tại trong bảng tests.")
      console.log("Cần thêm cột này vào bảng.")
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra cấu trúc bảng:", error.message)
  } finally {
    process.exit()
  }
}

checkTableStructure()
