const { query } = require("../config/database")

async function checkAndFixDatabase() {
  try {
    console.log("Đang kiểm tra và sửa chữa cấu trúc cơ sở dữ liệu...")

    // Kiểm tra bảng tests
    console.log("Kiểm tra bảng tests...")
    const testsColumns = await query("SHOW COLUMNS FROM tests")
    console.log(
      "Cấu trúc hiện tại của bảng tests:",
      testsColumns.map((col) => col.Field),
    )

    // Kiểm tra cột vietnamese_name
    const hasVietnameseName = testsColumns.some((col) => col.Field === "vietnamese_name")
    if (!hasVietnameseName) {
      console.log("Thêm cột vietnamese_name vào bảng tests...")
      await query("ALTER TABLE tests ADD COLUMN vietnamese_name VARCHAR(255) DEFAULT ''")
      console.log("Đã thêm cột vietnamese_name")
    }

    // Kiểm tra cột description
    const hasDescription = testsColumns.some((col) => col.Field === "description")
    if (!hasDescription) {
      console.log("Thêm cột description vào bảng tests...")
      await query("ALTER TABLE tests ADD COLUMN description TEXT")
      console.log("Đã thêm cột description")
    }

    // Kiểm tra dữ liệu trong bảng tests
    const tests = await query("SELECT * FROM tests")
    console.log(`Có ${tests.length} bài kiểm tra trong cơ sở dữ liệu`)

    // Kiểm tra các phần và câu hỏi
    for (const test of tests) {
      const parts = await query("SELECT * FROM parts WHERE test_id = ?", [test.id])
      console.log(`Bài kiểm tra ID ${test.id}: ${parts.length} phần`)

      for (const part of parts) {
        const questions = await query("SELECT * FROM questions WHERE part_id = ?", [part.id])
        console.log(`  Phần ${part.part_number}: ${questions.length} câu hỏi`)
      }
    }

    console.log("Kiểm tra và sửa chữa cơ sở dữ liệu hoàn tất!")
  } catch (error) {
    console.error("Lỗi khi kiểm tra và sửa chữa cơ sở dữ liệu:", error.message)
  } finally {
    process.exit()
  }
}

// Chạy hàm kiểm tra và sửa chữa
checkAndFixDatabase()
