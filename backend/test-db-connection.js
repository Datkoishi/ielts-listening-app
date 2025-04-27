const { connectDB, query } = require("./config/database")

async function testDatabaseConnection() {
  try {
    console.log("Kiểm tra kết nối database...")
    await connectDB()

    console.log("Kiểm tra các bảng...")
    const tables = await query("SHOW TABLES")
    console.log("Các bảng trong database:")
    tables.forEach((table) => {
      const tableName = Object.values(table)[0]
      console.log(`- ${tableName}`)
    })

    console.log("\nKiểm tra bảng tests...")
    const tests = await query("SELECT * FROM tests")
    console.log(`Số lượng bài kiểm tra: ${tests.length}`)

    console.log("\nKiểm tra bảng parts...")
    const parts = await query("SELECT * FROM parts")
    console.log(`Số lượng phần: ${parts.length}`)

    console.log("\nKiểm tra bảng questions...")
    const questions = await query("SELECT * FROM questions")
    console.log(`Số lượng câu hỏi: ${questions.length}`)

    console.log("\nKiểm tra bảng audio_files...")
    const audioFiles = await query("SELECT * FROM audio_files")
    console.log(`Số lượng file âm thanh: ${audioFiles.length}`)

    console.log("\nKiểm tra hoàn tất!")
    process.exit(0)
  } catch (error) {
    console.error("Lỗi khi kiểm tra database:", error)
    process.exit(1)
  }
}

testDatabaseConnection()
