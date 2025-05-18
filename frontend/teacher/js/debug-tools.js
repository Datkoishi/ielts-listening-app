// Công cụ debug cho ứng dụng

// Kiểm tra toàn diện hệ thống
async function runSystemCheck() {
    console.group("Kiểm tra hệ thống")
  
    try {
      // Kiểm tra kết nối server
      console.log("1. Đang kiểm tra kết nối server...")
      const serverConnected = await window.checkServerConnection()
      console.log(`   Kết nối server: ${serverConnected ? "✅ OK" : "❌ Lỗi"}`)
  
      // Kiểm tra kết nối database
      console.log("2. Đang kiểm tra kết nối cơ sở dữ liệu...")
      const dbConnected = await window.checkDatabaseConnection()
      console.log(`   Kết nối cơ sở dữ liệu: ${dbConnected ? "✅ OK" : "❌ Lỗi"}`)
  
      // Kiểm tra cấu trúc dữ liệu
      console.log("3. Đang kiểm tra cấu trúc dữ liệu...")
      const testData = window.test || {}
      console.log(`   Tiêu đề: ${testData.title || "Không có"}`)
      console.log(`   Mô tả: ${testData.description || "Không có"}`)
  
      let totalQuestions = 0
      for (let i = 1; i <= 4; i++) {
        const partQuestions = testData[`part${i}`]?.length || 0
        console.log(`   Phần ${i}: ${partQuestions} câu hỏi`)
        totalQuestions += partQuestions
      }
      console.log(`   Tổng số câu hỏi: ${totalQuestions}`)
  
      // Kiểm tra API
      console.log("4. Đang kiểm tra API...")
      try {
        const tests = await window.getTests()
        console.log(`   Lấy danh sách bài kiểm tra: ${tests ? "✅ OK" : "❌ Lỗi"}`)
        console.log(`   Số lượng bài kiểm tra: ${tests?.length || 0}`)
      } catch (error) {
        console.log(`   Lấy danh sách bài kiểm tra: ❌ Lỗi - ${error.message}`)
      }
  
      // Kiểm tra dữ liệu offline
      console.log("5. Đang kiểm tra dữ liệu offline...")
      const offlineTests = JSON.parse(localStorage.getItem("offlineTests") || "[]")
      console.log(`   Số lượng bài kiểm tra offline: ${offlineTests.length}`)
  
      // Kết luận
      console.log("6. Kết luận:")
      if (serverConnected && dbConnected) {
        console.log("   ✅ Hệ thống hoạt động bình thường")
      } else if (serverConnected && !dbConnected) {
        console.log("   ⚠️ Server hoạt động nhưng không kết nối được cơ sở dữ liệu")
      } else if (!serverConnected) {
        console.log("   ❌ Không kết nối được đến server")
      }
  
      return {
        serverConnected,
        dbConnected,
        testData: {
          title: testData.title,
          totalQuestions,
        },
        offlineTests: offlineTests.length,
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra hệ thống:", error)
      return { error: error.message }
    } finally {
      console.groupEnd()
    }
  }
  
  // Kiểm tra và hiển thị thông tin chi tiết về bài kiểm tra
  function inspectTestData() {
    const testData = window.test || {}
    console.group("Kiểm tra dữ liệu bài kiểm tra")
  
    try {
      console.log("Thông tin cơ bản:")
      console.log(`- Tiêu đề: ${testData.title || "Không có"}`)
      console.log(`- Tên tiếng Việt: ${testData.vietnameseName || "Không có"}`)
      console.log(`- Mô tả: ${testData.description || "Không có"}`)
      console.log(`- Phiên bản: ${testData.version || "1.0"}`)
  
      console.log("\nKiểm tra cấu trúc dữ liệu:")
  
      // Kiểm tra các phần
      for (let i = 1; i <= 4; i++) {
        const part = testData[`part${i}`] || []
        console.log(`\nPhần ${i}: ${part.length} câu hỏi`)
  
        if (part.length > 0) {
          console.log("Kiểm tra câu hỏi đầu tiên:")
          const firstQuestion = part[0]
          console.log(`- Loại: ${firstQuestion.type || "Không xác định"}`)
          console.log(`- Nội dung: ${JSON.stringify(firstQuestion.content).substring(0, 100)}...`)
          console.log(`- Đáp án: ${JSON.stringify(firstQuestion.correctAnswers).substring(0, 100)}...`)
  
          // Kiểm tra định dạng
          const contentType = typeof firstQuestion.content
          const answersType = typeof firstQuestion.correctAnswers
  
          console.log(`- Kiểu dữ liệu nội dung: ${contentType}`)
          console.log(`- Kiểu dữ liệu đáp án: ${answersType}`)
  
          if (contentType !== "string" && contentType !== "object") {
            console.warn(`⚠️ Định dạng nội dung không hợp lệ: ${contentType}`)
          }
  
          if (answersType !== "string" && answersType !== "object") {
            console.warn(`⚠️ Định dạng đáp án không hợp lệ: ${answersType}`)
          }
        }
      }
  
      // Kiểm tra tính hợp lệ tổng thể
      console.log("\nKiểm tra tính hợp lệ:")
  
      if (!testData.title) {
        console.error("❌ Thiếu tiêu đề bài kiểm tra")
      }
  
      let hasQuestions = false
      for (let i = 1; i <= 4; i++) {
        if (testData[`part${i}`]?.length > 0) {
          hasQuestions = true
          break
        }
      }
  
      if (!hasQuestions) {
        console.error("❌ Bài kiểm tra không có câu hỏi nào")
      }
  
      console.log(
        `Kết luận: Bài kiểm tra ${testData.title ? "có" : "không có"} tiêu đề và ${hasQuestions ? "có" : "không có"} câu hỏi`,
      )
  
      return {
        valid: !!testData.title && hasQuestions,
        title: testData.title,
        hasQuestions,
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra dữ liệu:", error)
      return { error: error.message }
    } finally {
      console.groupEnd()
    }
  }
  
  // Thêm vào window object
  window.runSystemCheck = runSystemCheck
  window.inspectTestData = inspectTestData
  