const fetch = require("node-fetch")

async function testAPI() {
  const baseUrl = "http://localhost:3000/api"

  try {
    console.log("Kiểm tra API...")

    // Kiểm tra API debug
    console.log("\n--- KIỂM TRA API DEBUG ---")
    const debugResponse = await fetch(`${baseUrl}/debug`)
    const debugData = await debugResponse.json()
    console.log("Kết quả:", debugData)

    // Kiểm tra API lấy danh sách bài thi
    console.log("\n--- KIỂM TRA API LẤY DANH SÁCH BÀI THI ---")
    const testsResponse = await fetch(`${baseUrl}/tests/public`)

    if (testsResponse.ok) {
      const testsData = await testsResponse.json()
      console.log(`Trạng thái: ${testsResponse.status} ${testsResponse.statusText}`)
      console.log(`Số lượng bài thi: ${testsData.length}`)

      if (testsData.length > 0) {
        console.log("\nDanh sách bài thi:")
        testsData.forEach((test, index) => {
          console.log(`${index + 1}. ID: ${test.id}, Tên: ${test.title}`)
        })

        // Kiểm tra API lấy chi tiết bài thi đầu tiên
        const testId = testsData[0].id
        console.log(`\n--- KIỂM TRA API LẤY CHI TIẾT BÀI THI ID: ${testId} ---`)
        const testDetailResponse = await fetch(`${baseUrl}/tests/public/${testId}`)

        if (testDetailResponse.ok) {
          const testDetail = await testDetailResponse.json()
          console.log(`Trạng thái: ${testDetailResponse.status} ${testDetailResponse.statusText}`)
          console.log(`Tên bài thi: ${testDetail.title}`)
          console.log(`Số phần: ${testDetail.sections ? testDetail.sections.length : "N/A"}`)

          if (testDetail.sections && testDetail.sections.length > 0) {
            console.log("\nDanh sách phần:")
            testDetail.sections.forEach((section, index) => {
              console.log(`${index + 1}. ID: ${section.id}, Tên: ${section.title}`)
              console.log(`   - Số câu hỏi: ${section.questions ? section.questions.length : "N/A"}`)
            })
          }
        } else {
          console.log(`Lỗi: ${testDetailResponse.status} ${testDetailResponse.statusText}`)
          const errorText = await testDetailResponse.text()
          console.log(`Chi tiết lỗi: ${errorText}`)
        }
      }
    } else {
      console.log(`Lỗi: ${testsResponse.status} ${testsResponse.statusText}`)
      const errorText = await testsResponse.text()
      console.log(`Chi tiết lỗi: ${errorText}`)
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra API:", error)
  }
}

// Chạy hàm kiểm tra
testAPI()
