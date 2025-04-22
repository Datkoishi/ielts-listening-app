const fetch = require("node-fetch")
const dotenv = require("dotenv")

dotenv.config()

const BASE_URL = `http://localhost:${process.env.PORT || 3000}/api`

async function testApiEndpoints() {
  try {
    console.log("Đang kiểm tra các API endpoint...")

    // Kiểm tra endpoint lấy danh sách bài kiểm tra công khai
    console.log("\n1. Kiểm tra GET /api/tests/public")
    const testsResponse = await fetch(`${BASE_URL}/tests/public`)
    const testsData = await testsResponse.json()
    console.log(`Trạng thái: ${testsResponse.status}`)
    console.log(`Dữ liệu: ${JSON.stringify(testsData).substring(0, 200)}...`)

    if (testsResponse.ok && testsData.length > 0) {
      const testId = testsData[0].id

      // Kiểm tra endpoint lấy bài kiểm tra theo ID
      console.log(`\n2. Kiểm tra GET /api/tests/public/${testId}`)
      const testResponse = await fetch(`${BASE_URL}/tests/public/${testId}`)
      const testData = await testResponse.json()
      console.log(`Trạng thái: ${testResponse.status}`)
      console.log(`Dữ liệu: ${JSON.stringify(testData).substring(0, 200)}...`)
    }

    console.log("\nKiểm tra API endpoint hoàn tất!")
  } catch (error) {
    console.error("Lỗi khi kiểm tra API endpoint:", error.message)
  } finally {
    process.exit()
  }
}

// Chạy hàm kiểm tra API
testApiEndpoints()
