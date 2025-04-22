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

    // Kiểm tra các cột cần thiết
    const requiredColumns = ["vietnamese_name", "description"]
    const missingColumns = []

    for (const col of requiredColumns) {
      const hasColumn = columns.some((column) => column.Field === col)
      if (!hasColumn) {
        missingColumns.push(col)
      }
    }

    if (missingColumns.length > 0) {
      console.log("\nCác cột sau KHÔNG tồn tại trong bảng tests:")
      missingColumns.forEach((col) => console.log(`- ${col}`))
      console.log("Cần thêm các cột này vào bảng.")
    } else {
      console.log("\nTất cả các cột cần thiết đều đã tồn tại trong bảng tests.")
    }

    // Kiểm tra bảng parts
    console.log("\nĐang kiểm tra cấu trúc bảng parts...")
    const [partColumns] = await pool.execute("SHOW COLUMNS FROM parts")
    console.log("Cấu trúc bảng parts:")
    partColumns.forEach((column) => {
      console.log(
        `- ${column.Field}: ${column.Type} ${column.Null === "NO" ? "NOT NULL" : ""} ${column.Key === "PRI" ? "PRIMARY KEY" : ""}`,
      )
    })

    // Kiểm tra bảng questions
    console.log("\nĐang kiểm tra cấu trúc bảng questions...")
    const [questionColumns] = await pool.execute("SHOW COLUMNS FROM questions")
    console.log("Cấu trúc bảng questions:")
    questionColumns.forEach((column) => {
      console.log(
        `- ${column.Field}: ${column.Type} ${column.Null === "NO" ? "NOT NULL" : ""} ${column.Key === "PRI" ? "PRIMARY KEY" : ""}`,
      )
    })

    // Kiểm tra dữ liệu trong bảng tests
    console.log("\nĐang kiểm tra dữ liệu trong bảng tests...")
    const [tests] = await pool.execute("SELECT * FROM tests LIMIT 5")
    console.log(`Số lượng bài kiểm tra: ${tests.length}`)
    if (tests.length > 0) {
      console.log("Dữ liệu mẫu:")
      console.log(tests[0])
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra cấu trúc bảng:", error.message)
  } finally {
    pool.end()
    process.exit()
  }
}

checkTableStructure()
