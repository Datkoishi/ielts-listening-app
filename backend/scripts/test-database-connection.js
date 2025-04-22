const { pool } = require("../config/database")

async function testDatabaseConnection() {
  try {
    console.log("Đang kiểm tra kết nối đến cơ sở dữ liệu...")

    // Kiểm tra kết nối
    const [result] = await pool.execute("SELECT 1 + 1 AS sum")
    console.log("Kết nối thành công! Kết quả truy vấn:", result[0].sum)

    // Kiểm tra các bảng
    console.log("\nĐang kiểm tra các bảng trong cơ sở dữ liệu...")
    const [tables] = await pool.execute("SHOW TABLES")

    console.log("Các bảng trong cơ sở dữ liệu:")
    tables.forEach((table) => {
      const tableName = Object.values(table)[0]
      console.log(`- ${tableName}`)
    })

    // Kiểm tra cấu trúc bảng tests
    if (tables.some((table) => Object.values(table)[0] === "tests")) {
      console.log("\nĐang kiểm tra cấu trúc bảng tests...")
      const [columns] = await pool.execute("DESCRIBE tests")
      console.log("Cấu trúc bảng tests:")
      columns.forEach((column) => {
        console.log(
          `- ${column.Field}: ${column.Type} ${column.Null === "NO" ? "NOT NULL" : ""} ${column.Key === "PRI" ? "PRIMARY KEY" : ""}`,
        )
      })
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra kết nối:", error.message)
  } finally {
    pool.end()
    process.exit()
  }
}

testDatabaseConnection()
