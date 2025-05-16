// Tích hợp frontend với backend API
const API_URL = "http://localhost:3000/api"
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000 // 1 giây

// Declare showNotification (assuming it's a global function or imported)
// If it's imported, replace this with the actual import statement
function showNotification(message, type) {
  // Implement your notification logic here, e.g., using an alert or a library
  console.log(`${type}: ${message}`) // Placeholder implementation
}

// Lưu token vào localStorage
function saveToken(token) {
  localStorage.setItem("token", token)
}

// Lấy token từ localStorage
function getToken() {
  return localStorage.getItem("token")
}

// Xóa token (đăng xuất)
function removeToken() {
  localStorage.removeItem("token")
}

// Kiểm tra đã đăng nhập chưa
function isLoggedIn() {
  return !!getToken() // Kiểm tra thực tế dựa trên token
}

// Lấy thông tin người dùng hiện tại
async function getCurrentUser() {
  try {
    if (!isLoggedIn()) {
      return { id: 1, username: "teacher", role: "teacher" } // Trả về người dùng mặc định nếu chưa đăng nhập
    }

    const response = await fetchWithAuth(`${API_URL}/users/me`)
    if (!response.ok) {
      throw new Error("Không thể lấy thông tin người dùng")
    }
    return await response.json()
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error)
    return { id: 1, username: "teacher", role: "teacher" } // Trả về người dùng mặc định nếu có lỗi
  }
}

// Đăng nhập
async function login(username, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Đăng nhập thất bại")
    }

    if (data.token) {
      saveToken(data.token)
      return true
    }

    return false
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error)
    throw error
  }
}

// Đăng ký
async function register(username, password, role = "teacher") {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, role }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Đăng ký thất bại")
    }

    return true
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error)
    throw error
  }
}

// Hàm fetch với xác thực và thử lại
async function fetchWithAuth(url, options = {}) {
  let attempts = 0
  const token = getToken()

  // Thêm header Authorization nếu có token
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  while (attempts < MAX_RETRY_ATTEMPTS) {
    try {
      const response = await fetch(url, options)

      // Nếu token hết hạn (401), thử đăng nhập lại hoặc xóa token
      if (response.status === 401) {
        removeToken() // Xóa token không hợp lệ
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
      }

      return response
    } catch (error) {
      attempts++
      if (attempts >= MAX_RETRY_ATTEMPTS) {
        throw error
      }

      // Đợi trước khi thử lại
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * attempts))
    }
  }
}

// Chuẩn hóa dữ liệu câu hỏi trước khi gửi đến server
function normalizeQuestionData(question) {
  // Đảm bảo các trường cần thiết tồn tại
  const normalizedQuestion = {
    type: question.type,
    content: Array.isArray(question.content) ? question.content : [],
    correctAnswers: question.correctAnswers || [],
  }

  // Chuyển đổi correctAnswers thành mảng nếu nó không phải là mảng
  if (!Array.isArray(normalizedQuestion.correctAnswers)) {
    normalizedQuestion.correctAnswers = [normalizedQuestion.correctAnswers]
  }

  return normalizedQuestion
}

// Cập nhật hàm normalizeTestData để đảm bảo dữ liệu khớp với schema cơ sở dữ liệu
function normalizeTestData(testData) {
  // Kiểm tra dữ liệu đầu vào
  if (!testData) {
    console.error("Dữ liệu bài kiểm tra không hợp lệ:", testData)
    throw new Error("Dữ liệu bài kiểm tra không hợp lệ")
  }

  // Log dữ liệu đầu vào để debug
  console.log("Dữ liệu đầu vào của normalizeTestData:", JSON.stringify(testData, null, 2))

  // Chuẩn bị dữ liệu cơ bản
  const normalizedTest = {
    title: testData.title || "",
    vietnamese_name: testData.vietnameseName || "",
    description: testData.description || "",
    // Thêm trường content để lưu thông tin bổ sung
    content: JSON.stringify({
      difficulty: "medium", // Mặc định là trung bình
      total_questions: calculateTotalQuestions(testData),
      type: "listening",
      version: testData.version || "1.0", // Phiên bản mặc định
    }),
    // Thêm trường version để theo dõi phiên bản
    version: testData.version || "1.0",
    // Thêm trường status nếu cần
    status: "active",
    // Cấu trúc parts theo đúng schema
    parts: [],
  }

  // Tính tổng số câu hỏi
  function calculateTotalQuestions(data) {
    let total = 0
    for (let i = 1; i <= 4; i++) {
      if (data[`part${i}`] && Array.isArray(data[`part${i}`])) {
        total += data[`part${i}`].length
      }
    }
    return total
  }

  // Chuyển đổi parts theo đúng cấu trúc schema
  for (let i = 1; i <= 4; i++) {
    if (testData[`part${i}`] && testData[`part${i}`].length > 0) {
      const partQuestions = testData[`part${i}`].map((question, qIndex) => {
        // Map question_type string sang type_id (theo schema)
        const typeIdMap = {
          "Một đáp án": 1,
          "Nhiều đáp án": 2,
          "Ghép nối": 3,
          "Ghi nhãn Bản đồ/Sơ đồ": 4,
          "Hoàn thành ghi chú": 5,
          "Hoàn thành bảng/biểu mẫu": 6,
          "Hoàn thành lưu đồ": 7,
        }

        // Đảm bảo content và correctAnswers là chuỗi JSON
        let contentStr = question.content
        if (typeof contentStr !== "string") {
          contentStr = JSON.stringify(contentStr)
        }

        let correctAnswersStr = question.correctAnswers
        if (typeof correctAnswersStr !== "string") {
          correctAnswersStr = JSON.stringify(correctAnswersStr)
        }

        return {
          question_type: question.type,
          // Thêm type_id để liên kết với bảng question_types
          type_id: typeIdMap[question.type] || 1,
          content: contentStr,
          correct_answers: correctAnswersStr,
          // Thêm các trường bổ sung theo schema
          difficulty: "medium",
          points: 1,
          position: qIndex + 1, // Vị trí câu hỏi trong phần
        }
      })

      normalizedTest.parts.push({
        part_number: i,
        // Thêm instructions cho mỗi phần
        instructions: `Instructions for Part ${i}`,
        // Thêm content để lưu thông tin bổ sung
        content: JSON.stringify({
          title: `Part ${i}`,
          description: `Description for Part ${i}`,
          question_count: testData[`part${i}`].length,
        }),
        questions: partQuestions,
      })
    }
  }

  // Log dữ liệu đã chuẩn hóa để debug
  console.log("Dữ liệu đã chuẩn hóa:", JSON.stringify(normalizedTest, null, 2))

  return normalizedTest
}

// Lưu bài kiểm tra lên server
// Cập nhật hàm saveTestToServer để cải thiện xử lý lỗi
async function saveTestToServer(testData) {
  try {
    // Hiển thị thông báo đang kết nối
    showNotification("Đang kết nối với máy chủ...", "info")

    // Đảm bảo sử dụng đối tượng test toàn cục
    const globalTest = window.test || testData

    console.log("Dữ liệu bài kiểm tra nhận được:", JSON.stringify(testData, null, 2))
    console.log("Đối tượng test toàn cục:", JSON.stringify(globalTest, null, 2))

    // Kiểm tra tiêu đề bài kiểm tra
    if (!globalTest.title || globalTest.title.trim() === "") {
      showNotification("Lỗi: Tiêu đề bài kiểm tra không được để trống", "error")
      return { success: false, error: "Tiêu đề bài kiểm tra không được để trống" }
    }

    // Kiểm tra kết nối mạng
    if (!navigator.onLine) {
      // Lưu dữ liệu vào localStorage để đồng bộ sau
      const offlineId = saveTestOffline(globalTest)
      showNotification("Đang offline: Bài kiểm tra đã được lưu cục bộ và sẽ được đồng bộ khi có kết nối", "warning")
      return { success: true, offline: true, message: "Đã lưu offline", offlineId }
    }

    // Kiểm tra xem có câu hỏi nào không
    let hasQuestions = false
    let totalQuestions = 0

    for (let i = 1; i <= 4; i++) {
      if (globalTest[`part${i}`] && globalTest[`part${i}`].length > 0) {
        hasQuestions = true
        totalQuestions += globalTest[`part${i}`].length
      }
    }

    console.log(`Bài kiểm tra có câu hỏi: ${hasQuestions}, Tổng số câu hỏi: ${totalQuestions}`)

    if (!hasQuestions) {
      showNotification("Lỗi: Bài kiểm tra phải có ít nhất một câu hỏi", "error")
      return { success: false, error: "Bài kiểm tra phải có ít nhất một câu hỏi" }
    }

    // Chuẩn hóa dữ liệu trước khi gửi
    const normalizedData = normalizeTestData(globalTest)
    console.log("Dữ liệu đã chuẩn hóa sẽ được gửi:", JSON.stringify(normalizedData, null, 2))

    // Kiểm tra cấu hình API_URL
    if (!API_URL) {
      console.error("API_URL không được định nghĩa")
      showNotification("Lỗi cấu hình: API_URL không được định nghĩa", "error")
      return { success: false, error: "API_URL không được định nghĩa" }
    }

    // Hiển thị thông tin về API endpoint
    console.log(`Đang gửi dữ liệu đến: ${API_URL}/tests`)

    // Gửi yêu cầu API với timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 giây timeout

    try {
      // Thêm log để kiểm tra dữ liệu trước khi gửi
      console.log("Body request:", JSON.stringify(normalizedData))

      const response = await fetch(`${API_URL}/tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalizedData),
        credentials: "include",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Kiểm tra và hiển thị thông tin response
      console.log("Response status:", response.status)
      console.log("Response headers:", [...response.headers.entries()])

      const responseText = await response.text()
      console.log("Response text:", responseText)

      let result
      try {
        result = JSON.parse(responseText)
      } catch (e) {
        console.error("Không thể parse JSON response:", e)
        throw new Error(`Lỗi khi xử lý phản hồi từ server: ${responseText}`)
      }

      if (!response.ok) {
        console.error("Server error response:", result)
        throw new Error(result.message || `Lỗi server: ${response.status} ${response.statusText}`)
      }

      console.log("Server response after saving test:", result)

      if (result.testId) {
        localStorage.setItem("lastSavedTestId", result.testId)
        showNotification(`Bài kiểm tra đã được lưu thành công! ID: ${result.testId}`, "success")
      } else {
        console.warn("Server không trả về testId trong phản hồi:", result)
        showNotification("Bài kiểm tra có thể đã được lưu nhưng không nhận được ID", "warning")
      }

      return result
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === "AbortError") {
        console.error("Yêu cầu bị hủy do timeout")
        throw new Error("Yêu cầu bị hủy do timeout. Vui lòng kiểm tra kết nối mạng và thử lại.")
      }
      throw error
    }
  } catch (error) {
    console.error("Lỗi khi lưu bài kiểm tra lên máy chủ:", error)

    // Hiển thị thông báo lỗi chi tiết
    let errorMessage = error.message || "Lỗi không xác định"
    if (error.response) {
      errorMessage = `Lỗi server (${error.response.status}): ${error.response.statusText}`
    } else if (error.request) {
      errorMessage = "Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng."
    }

    showNotification(`Lỗi: ${errorMessage}`, "error")

    // Nếu có lỗi mạng hoặc server không hoạt động, cung cấp phương án dự phòng
    if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
      // Lưu offline nếu không kết nối được
      const offlineId = saveTestOffline(globalTest || testData)
      showNotification("Không thể kết nối đến máy chủ. Bài kiểm tra đã được lưu cục bộ.", "warning")
      return { success: false, offline: true, message: "Đã lưu offline do lỗi kết nối", offlineId }
    }

    throw error
  }
}

// Cập nhật hàm kiểm tra kết nối server
async function checkServerConnection() {
  try {
    console.log("Đang kiểm tra kết nối server...")
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 giây timeout

    // Sử dụng endpoint health check mới
    const url = `${API_URL}/health`
    console.log("URL kiểm tra kết nối:", url)

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      // Thêm mode: 'cors' để xử lý vấn đề CORS
      mode: "cors",
      // Thêm credentials để xử lý vấn đề cookie
      credentials: "include",
    })

    clearTimeout(timeoutId)

    // Log response để debug
    console.log("Response status:", response.status)

    if (response.ok) {
      const data = await response.json()
      console.log("Kết nối server thành công:", data)
      return true
    } else {
      console.error("Server không phản hồi đúng:", response.status, response.statusText)
      // Thử đọc response body để xem lỗi chi tiết
      try {
        const errorData = await response.json()
        console.error("Error details:", errorData)
      } catch (e) {
        console.error("Không thể đọc chi tiết lỗi")
      }
      return false
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra kết nối server:", error)
    return false
  }
}

// Thêm hàm kiểm tra kết nối cơ sở dữ liệu
async function checkDatabaseConnection() {
  try {
    console.log("Đang kiểm tra kết nối cơ sở dữ liệu...")
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 giây timeout

    const url = `${API_URL}/health/db`
    console.log("URL kiểm tra kết nối DB:", url)

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      mode: "cors",
      credentials: "include",
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      console.log("Kết nối cơ sở dữ liệu:", data)
      return data.status === "success"
    } else {
      console.error("Kiểm tra cơ sở dữ liệu thất bại:", response.status, response.statusText)
      return false
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra kết nối cơ sở dữ liệu:", error)
    return false
  }
}

// Thêm hàm lưu offline
function saveTestOffline(testData) {
  try {
    // Tạo ID tạm thời
    const tempId = `offline_${Date.now()}`

    // Lưu vào localStorage
    const offlineTests = JSON.parse(localStorage.getItem("offlineTests") || "[]")
    offlineTests.push({
      id: tempId,
      data: testData,
      timestamp: Date.now(),
    })

    localStorage.setItem("offlineTests", JSON.stringify(offlineTests))
    console.log("Đã lưu bài kiểm tra offline:", tempId)

    return tempId
  } catch (error) {
    console.error("Lỗi khi lưu offline:", error)
    return null
  }
}

// Thêm hàm đồng bộ các bài kiểm tra offline
async function syncOfflineTests() {
  try {
    const offlineTests = JSON.parse(localStorage.getItem("offlineTests") || "[]")

    if (offlineTests.length === 0) {
      return { success: true, synced: 0 }
    }

    let syncedCount = 0
    const failedTests = []

    for (const test of offlineTests) {
      try {
        // Gửi lên server
        const response = await fetchWithAuth(`${API_URL}/tests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(test.data),
          credentials: "include",
        })

        if (response.ok) {
          syncedCount++
        } else {
          failedTests.push(test)
        }
      } catch (error) {
        console.error("Lỗi khi đồng bộ bài kiểm tra:", error)
        failedTests.push(test)
      }
    }

    // Cập nhật lại danh sách các bài kiểm tra chưa đồng bộ được
    localStorage.setItem("offlineTests", JSON.stringify(failedTests))

    return {
      success: true,
      synced: syncedCount,
      failed: failedTests.length,
    }
  } catch (error) {
    console.error("Lỗi khi đồng bộ các bài kiểm tra offline:", error)
    return { success: false, error: error.message }
  }
}

// Thêm hàm validate câu hỏi theo loại
function validateQuestionByType(question, partIndex, questionIndex) {
  switch (question.type) {
    case "Một đáp án":
      if (question.content.length < 2) {
        console.warn(`Câu hỏi ${questionIndex} trong Phần ${partIndex} thiếu lựa chọn`)
        question.content.push("Lựa chọn mặc định")
      }
      break

    case "Nhiều đáp án":
      if (question.content.length < 2) {
        console.warn(`Câu hỏi ${questionIndex} trong Phần ${partIndex} thiếu lựa chọn`)
        question.content.push("Lựa chọn mặc định 1")
        question.content.push("Lựa chọn mặc định 2")
      }
      if (!Array.isArray(question.correctAnswers)) {
        console.warn(`Câu hỏi ${questionIndex} trong Phần ${partIndex} có đáp án không đúng định dạng`)
        question.correctAnswers = [question.correctAnswers]
      }
      break

    case "Ghi nhãn Bản đồ/Sơ đồ":
      // Kiểm tra có hình ảnh không
      if (!question.content[2] || !question.content[2].includes("/")) {
        console.warn(`Câu hỏi ${questionIndex} trong Phần ${partIndex} thiếu hình ảnh`)
        question.content[2] = "/placeholder.svg?height=300&width=400"
      }
      break
  }
}

// Helper functions to extract question data from DOM elements
function extractOneAnswerDataFromDOM(questionElement) {
  try {
    const questionContent = questionElement.querySelector(".question-content")
    if (!questionContent) return defaultQuestionData("Một đáp án")

    const paragraphs = questionContent.querySelectorAll("p")
    if (paragraphs.length < 2) return defaultQuestionData("Một đáp án")

    const questionText = paragraphs[0].textContent.replace("Nội dung:", "").trim()

    const options = []
    const optionsList = questionContent.querySelector("ul")
    if (optionsList) {
      const optionItems = optionsList.querySelectorAll("li")
      optionItems.forEach((item) => {
        // Remove the "(Đúng)" text if present
        const optionText = item.textContent.replace(/$$Đúng$$/, "").trim()
        options.push(optionText)

        // Check if this is the correct answer
        if (item.textContent.includes("(Đúng)")) {
          correctAnswer = optionText
        }
      })
    }

    // Find the correct answer
    let correctAnswer = options[0] || "Default answer"
    const correctAnswerText = Array.from(paragraphs).find((p) => p.textContent.includes("Đáp án đúng:"))
    if (correctAnswerText) {
      correctAnswer = correctAnswerText.textContent.replace("Đáp án đúng:", "").trim()
    }

    return {
      type: "Một đáp án",
      content: [questionText, ...options],
      correctAnswers: correctAnswer,
    }
  } catch (error) {
    console.error("Error extracting One Answer data from DOM:", error)
    return defaultQuestionData("Một đáp án")
  }
}

function extractMultipleAnswerDataFromDOM(questionElement) {
  try {
    const questionContent = questionElement.querySelector(".question-content")
    if (!questionContent) return defaultQuestionData("Nhiều đáp án")

    const paragraphs = questionContent.querySelectorAll("p")
    if (paragraphs.length < 2) return defaultQuestionData("Nhiều đáp án")

    const questionText = paragraphs[0].textContent.replace("Nội dung:", "").trim()

    const options = []
    const correctAnswers = []
    const optionsList = questionContent.querySelector("ul")

    if (optionsList) {
      const optionItems = optionsList.querySelectorAll("li")
      optionItems.forEach((item) => {
        // Remove the "(Đúng)" text if present
        const optionText = item.textContent.replace(/$$Đúng$$/, "").trim()
        options.push(optionText)

        // Check if this is a correct answer
        if (item.textContent.includes("(Đúng)")) {
          correctAnswers.push(optionText)
        }
      })
    }

    // If no correct answers were found, check for explicit listing
    if (correctAnswers.length === 0) {
      const correctAnswerText = Array.from(paragraphs).find((p) => p.textContent.includes("Đáp án đúng:"))
      if (correctAnswerText) {
        const answersText = correctAnswerText.textContent.replace("Đáp án đúng:", "").trim()
        answersText.split(",").forEach((answer) => {
          correctAnswers.push(answer.trim())
        })
      }
    }

    return {
      type: "Nhiều đáp án",
      content: [questionText, ...options],
      correctAnswers: correctAnswers.length > 0 ? correctAnswers : [options[0] || "Default answer"],
    }
  } catch (error) {
    console.error("Error extracting Multiple Answer data from DOM:", error)
    return defaultQuestionData("Nhiều đáp án")
  }
}

function extractMatchingDataFromDOM(questionElement) {
  try {
    const questionContent = questionElement.querySelector(".question-content")
    if (!questionContent) return defaultQuestionData("Ghép nối")

    const questionText =
      questionContent.querySelector("p")?.textContent.replace("Nội dung:", "").trim() || "Matching question"

    const leftItems = []
    const rightItems = []
    const correctPairs = []

    const leftList = questionContent.querySelector(".left-column ul")
    const rightList = questionContent.querySelector(".right-column ul")

    if (leftList && rightList) {
      const leftElements = leftList.querySelectorAll("li")
      const rightElements = rightList.querySelectorAll("li")

      leftElements.forEach((item) => {
        leftItems.push(item.textContent.trim())
      })

      rightElements.forEach((item) => {
        rightItems.push(item.textContent.trim())
      })

      // Extract matching pairs
      const matchingInfo = questionContent.querySelector(".matching-info")
      if (matchingInfo) {
        const pairs = matchingInfo.querySelectorAll("p")
        pairs.forEach((pair) => {
          const pairText = pair.textContent.trim()
          const match = pairText.match(/(\w+)\s*-\s*(\w+)/)
          if (match) {
            correctPairs.push([match[1], match[2]])
          }
        })
      }
    }

    return {
      type: "Ghép nối",
      content: [questionText, leftItems, rightItems],
      correctAnswers: correctPairs.length > 0 ? correctPairs : [[leftItems[0] || "Item 1", rightItems[0] || "Item A"]],
    }
  } catch (error) {
    console.error("Error extracting Matching data from DOM:", error)
    return defaultQuestionData("Ghép nối")
  }
}

function extractPlanMapDiagramDataFromDOM(questionElement) {
  try {
    const questionContent = questionElement.querySelector(".question-content")
    if (!questionContent) return defaultQuestionData("Ghi nhãn Bản đồ/Sơ đồ")

    const questionText =
      questionContent.querySelector("p")?.textContent.replace("Nội dung:", "").trim() || "Map/Diagram question"

    const imageElement = questionContent.querySelector("img")
    const imageUrl = imageElement ? imageElement.src : ""

    const locations = []
    const locationElements = questionContent.querySelectorAll(".location-item")

    locationElements.forEach((item, index) => {
      const label = item.querySelector(".location-label")?.textContent.trim() || `Location ${index + 1}`
      const answer =
        item.querySelector(".location-answer")?.textContent.replace("Đáp án:", "").trim() || `Answer ${index + 1}`
      const x = Number.parseFloat(item.getAttribute("data-x") || "0")
      const y = Number.parseFloat(item.getAttribute("data-y") || "0")

      locations.push({ label, answer, x, y })
    })

    return {
      type: "Ghi nhãn Bản đồ/Sơ đồ",
      content: [questionText, imageUrl, locations],
      correctAnswers: locations.map((loc) => loc.answer),
    }
  } catch (error) {
    console.error("Error extracting Plan/Map/Diagram data from DOM:", error)
    return defaultQuestionData("Ghi nhãn Bản đồ/Sơ đồ")
  }
}

function extractNoteCompletionDataFromDOM(questionElement) {
  try {
    const questionContent = questionElement.querySelector(".question-content")
    if (!questionContent) return defaultQuestionData("Hoàn thành ghi chú")

    const questionText =
      questionContent.querySelector("p")?.textContent.replace("Nội dung:", "").trim() || "Note completion question"

    const noteText = questionContent.querySelector(".note-text")?.innerHTML || ""
    const blanks = []
    const answers = []

    const answerElements = questionContent.querySelectorAll(".blank-answer")
    answerElements.forEach((item, index) => {
      const blankNumber = item.getAttribute("data-blank-number") || (index + 1).toString()
      const answer = item.textContent.replace("Đáp án:", "").trim() || `Answer ${index + 1}`

      blanks.push(blankNumber)
      answers.push(answer)
    })

    return {
      type: "Hoàn thành ghi chú",
      content: [questionText, noteText, blanks],
      correctAnswers: answers,
    }
  } catch (error) {
    console.error("Error extracting Note Completion data from DOM:", error)
    return defaultQuestionData("Hoàn thành ghi chú")
  }
}

function extractFormTableCompletionDataFromDOM(questionElement) {
  try {
    const questionContent = questionElement.querySelector(".question-content")
    if (!questionContent) return defaultQuestionData("Hoàn thành bảng/biểu mẫu")

    const questionText =
      questionContent.querySelector("p")?.textContent.replace("Nội dung:", "").trim() ||
      "Form/Table completion question"

    const tableHTML = questionContent.querySelector(".table-content")?.innerHTML || ""
    const blanks = []
    const answers = []

    const answerElements = questionContent.querySelectorAll(".table-answer")
    answerElements.forEach((item, index) => {
      const blankNumber = item.getAttribute("data-blank-number") || (index + 1).toString()
      const answer = item.textContent.replace("Đáp án:", "").trim() || `Answer ${index + 1}`

      blanks.push(blankNumber)
      answers.push(answer)
    })

    return {
      type: "Hoàn thành bảng/biểu mẫu",
      content: [questionText, tableHTML, blanks],
      correctAnswers: answers,
    }
  } catch (error) {
    console.error("Error extracting Form/Table Completion data from DOM:", error)
    return defaultQuestionData("Hoàn thành bảng/biểu mẫu")
  }
}

function extractFlowChartCompletionDataFromDOM(questionElement) {
  try {
    const questionContent = questionElement.querySelector(".question-content")
    if (!questionContent) return defaultQuestionData("Hoàn thành lưu đồ")

    const questionText =
      questionContent.querySelector("p")?.textContent.replace("Nội dung:", "").trim() ||
      "Flow chart completion question"

    const chartHTML = questionContent.querySelector(".flowchart-content")?.innerHTML || ""
    const blanks = []
    const answers = []

    const answerElements = questionContent.querySelectorAll(".flowchart-answer")
    answerElements.forEach((item, index) => {
      const blankNumber = item.getAttribute("data-blank-number") || (index + 1).toString()
      const answer = item.textContent.replace("Đáp án:", "").trim() || `Answer ${index + 1}`

      blanks.push(blankNumber)
      answers.push(answer)
    })

    return {
      type: "Hoàn thành lưu đồ",
      content: [questionText, chartHTML, blanks],
      correctAnswers: answers,
    }
  } catch (error) {
    console.error("Error extracting Flow Chart Completion data from DOM:", error)
    return defaultQuestionData("Hoàn thành lưu đồ")
  }
}

function defaultQuestionData(type) {
  switch (type) {
    case "Một đáp án":
      return {
        type: type,
        content: ["Default question", "Option A", "Option B", "Option C"],
        correctAnswers: "Option A",
      }
    case "Nhiều đáp án":
      return {
        type: type,
        content: ["Default question", "Option A", "Option B", "Option C"],
        correctAnswers: ["Option A", "Option B"],
      }
    case "Ghép nối":
      return {
        type: type,
        content: ["Default matching question", ["Item 1", "Item 2"], ["Item A", "Item B"]],
        correctAnswers: [
          ["Item 1", "Item A"],
          ["Item 2", "Item B"],
        ],
      }
    case "Ghi nhãn Bản đồ/Sơ đồ":
      return {
        type: type,
        content: ["Default map/diagram question", "", [{ label: "Location 1", x: 100, y: 100 }]],
        correctAnswers: ["Answer 1"],
      }
    case "Hoàn thành ghi chú":
      return {
        type: type,
        content: ["Default note completion", "Note with [1] and [2] blanks", ["1", "2"]],
        correctAnswers: ["Answer 1", "Answer 2"],
      }
    case "Hoàn thành bảng/biểu mẫu":
      return {
        type: type,
        content: ["Default table completion", "<table><tr><td>[1]</td><td>[2]</td></tr></table>", ["1", "2"]],
        correctAnswers: ["Answer 1", "Answer 2"],
      }
    case "Hoàn thành lưu đồ":
      return {
        type: type,
        content: ["Default flow chart completion", "<div>[1] → [2] → [3]</div>", ["1", "2", "3"]],
        correctAnswers: ["Answer 1", "Answer 2", "Answer 3"],
      }
    default:
      return {
        type: type,
        content: ["Default question"],
        correctAnswers: ["Default answer"],
      }
  }
}

// Lấy danh sách bài kiểm tra
async function getTests() {
  try {
    console.log("Fetching tests from API:", `${API_URL}/tests`)

    const response = await fetchWithAuth(`${API_URL}/tests`)
    console.log("Get tests response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch((e) => ({ message: "Could not parse error response" }))
      console.error("Error fetching tests:", errorData)
      throw new Error(`Không thể lấy danh sách bài kiểm tra: ${response.status} ${response.statusText}`)
    }

    const tests = await response.json()
    console.log(`Retrieved ${tests.length} tests from server`)
    return tests
  } catch (error) {
    console.error("Error in getTests function:", error)
    showNotification(`Lỗi khi lấy danh sách bài kiểm tra: ${error.message}`, "error")
    return []
  }
}

// Lấy chi tiết bài kiểm tra theo ID
async function getTestById(testId) {
  try {
    const response = await fetchWithAuth(`${API_URL}/tests/${testId}`)

    if (!response.ok) {
      throw new Error("Không thể lấy thông tin bài kiểm tra")
    }

    return await response.json()
  } catch (error) {
    console.error("Lỗi khi lấy thông tin bài kiểm tra:", error)
    return null
  }
}

// Cập nhật bài kiểm tra
async function updateTest(testId, testData) {
  try {
    // Chuẩn hóa dữ liệu trước khi gửi
    const normalizedData = normalizeTestData(testData)

    const response = await fetchWithAuth(`${API_URL}/tests/${testId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Cập nhật bài kiểm tra thất bại")
    }

    return await response.json()
  } catch (error) {
    console.error("Lỗi khi cập nhật bài kiểm tra:", error)
    throw error
  }
}

// Xóa bài kiểm tra
async function deleteTest(testId) {
  try {
    const response = await fetchWithAuth(`${API_URL}/tests/${testId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Xóa bài kiểm tra thất bại")
    }

    return await response.json()
  } catch (error) {
    console.error("Lỗi khi xóa bài kiểm tra:", error)
    throw error
  }
}

// Thêm event listener để đồng bộ khi online trở lại
window.addEventListener("online", async () => {
  console.log("Kết nối internet đã được khôi phục, đang đồng bộ dữ liệu...")
  const result = await syncOfflineTests()

  if (result.synced > 0) {
    showNotification(`Đã đồng bộ ${result.synced} bài kiểm tra lên máy chủ.`, "success")
  }

  if (result.failed > 0) {
    showNotification(`Không thể đồng bộ ${result.failed} bài kiểm tra. Sẽ thử lại sau.`, "warning")
  }
})

// Thêm các hàm mới vào window object
window.syncOfflineTests = syncOfflineTests
window.checkServerConnection = checkServerConnection
window.checkDatabaseConnection = checkDatabaseConnection

// Thêm hàm kiểm tra trạng thái lưu của bài kiểm tra
async function checkTestSaveStatus(testTitle) {
  try {
    // Kiểm tra nếu testTitle không tồn tại
    if (!testTitle) {
      return { saved: false, reason: "Chưa nhập tiêu đề bài kiểm tra" }
    }

    console.log("Đang kiểm tra trạng thái lưu cho bài kiểm tra:", testTitle)

    // Kiểm tra kết nối server
    const isServerConnected = await checkServerConnection()
    console.log("Kết quả kiểm tra kết nối server:", isServerConnected)

    if (!isServerConnected) {
      console.log("Không thể kết nối đến server để kiểm tra")

      // Kiểm tra trong localStorage
      const offlineTests = JSON.parse(localStorage.getItem("offlineTests") || "[]")
      console.log("Số lượng bài kiểm tra offline:", offlineTests.length)

      const offlineTest = offlineTests.find(
        (test) => test.data && (test.data.title === testTitle || test.data.vietnameseName === testTitle),
      )

      if (offlineTest) {
        console.log("Đã tìm thấy bài kiểm tra trong dữ liệu offline:", offlineTest.id)
        return {
          saved: true,
          location: "offline",
          id: offlineTest.id,
          timestamp: new Date(offlineTest.timestamp).toLocaleString(),
        }
      }

      return { saved: false, reason: "Không thể kết nối đến server" }
    }

    // Nếu kết nối được server, thử lấy danh sách bài kiểm tra
    try {
      const tests = await getTests()
      console.log("Tests retrieved from server:", tests)

      // Log the test titles to help with debugging
      if (tests && Array.isArray(tests)) {
        console.log(
          "Available test titles:",
          tests.map((t) => t.title),
        )
        console.log("Looking for test with title:", testTitle)
      }

      if (!tests || !Array.isArray(tests)) {
        return { saved: false, reason: "Không thể lấy danh sách bài kiểm tra từ server" }
      }

      // Tìm bài kiểm tra theo tiêu đề hoặc tên tiếng Việt
      const test = tests.find((test) => test.title === testTitle || test.vietnamese_name === testTitle)

      if (test) {
        console.log("Đã tìm thấy bài kiểm tra trên server:", test.id)
        return {
          saved: true,
          location: "database",
          id: test.id,
          timestamp: new Date(test.created_at || test.updated_at || Date.now()).toLocaleString(),
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài kiểm tra từ server:", error)
    }

    // Kiểm tra trong localStorage nếu không tìm thấy trên server
    const offlineTests = JSON.parse(localStorage.getItem("offlineTests") || "[]")
    const offlineTest = offlineTests.find(
      (test) => test.data && (test.data.title === testTitle || test.data.vietnameseName === testTitle),
    )

    if (offlineTest) {
      console.log("Đã tìm thấy bài kiểm tra trong dữ liệu offline:", offlineTest.id)
      return {
        saved: true,
        location: "offline",
        id: offlineTest.id,
        timestamp: new Date(offlineTest.timestamp).toLocaleString(),
      }
    }

    return { saved: false, reason: "Không tìm thấy bài kiểm tra" }
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái lưu:", error)
    return { saved: false, reason: error.message || "Lỗi không xác định" }
  }
}

// Thêm hàm vào window object
window.checkTestSaveStatus = checkTestSaveStatus

// Add this new function after the checkTestSaveStatus function

// Thêm hàm kiểm tra bài kiểm tra theo tiêu đề
async function checkTestByTitle(title) {
  try {
    if (!title) {
      return { exists: false, message: "Tiêu đề không được để trống" }
    }

    console.log(`Checking if test with title '${title}' exists via dedicated endpoint`)

    const response = await fetchWithAuth(`${API_URL}/tests/check-by-title?title=${encodeURIComponent(title)}`)

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log("Check test by title result:", result)

    return result
  } catch (error) {
    console.error("Error checking test by title:", error)
    return { exists: false, message: error.message }
  }
}

// Add to window object
window.checkTestByTitle = checkTestByTitle

// Thêm các hàm mới vào window object
window.saveToken = saveToken
window.getToken = getToken
window.removeToken = removeToken
window.isLoggedIn = isLoggedIn
window.getCurrentUser = getCurrentUser
window.login = login
window.register = register
window.saveTestToServer = saveTestToServer
window.getTests = getTests
window.getTestById = getTestById
window.updateTest = updateTest
window.deleteTest = deleteTest
