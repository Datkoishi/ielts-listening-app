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

// Chuẩn hóa dữ liệu bài kiểm tra trước khi gửi đến server
function normalizeTestData(testData) {
  const normalizedTest = {
    title: testData.title || "",
    vietnamese_name: testData.vietnameseName || "",
    description: testData.description || "",
    version: testData.version || 1,
    created_by: testData.createdBy || 1, // Mặc định là user ID 1 nếu không có
    content: JSON.stringify({
      difficulty: testData.difficulty || "medium",
      total_questions: calculateTotalQuestions(testData),
      type: "listening",
      metadata: {
        last_modified: new Date().toISOString(),
        status: testData.status || "draft",
      },
    }),
    parts: [],
  }

  // Tính tổng số câu hỏi
  function calculateTotalQuestions(test) {
    let total = 0
    for (let i = 1; i <= 4; i++) {
      if (test[`part${i}`] && Array.isArray(test[`part${i}`])) {
        total += test[`part${i}`].length
      }
    }
    return total
  }

  // Chuyển đổi parts sang định dạng phù hợp với database
  for (let i = 1; i <= 4; i++) {
    if (testData[`part${i}`] && testData[`part${i}`].length > 0) {
      const partData = {
        part_number: i,
        instructions: testData[`part${i}Instructions`] || `Hướng dẫn cho phần ${i}`,
        audio_url: testData[`part${i}AudioUrl`] || null, // Thêm audio_url từ dữ liệu
        questions: testData[`part${i}`].map((question) => {
          // Map question_type string sang type_id
          const typeId = getQuestionTypeId(question.type)

          // Đảm bảo content là một mảng
          const content = Array.isArray(question.content) ? question.content : [question.content || ""]

          // Đảm bảo correctAnswers tồn tại
          const correctAnswers = question.correctAnswers || []

          return {
            question_type: typeId,
            content: JSON.stringify({
              text: content.length > 0 ? content[0] : "",
              options: content.length > 1 ? content.slice(1) : [],
              metadata: {
                difficulty: question.difficulty || "medium",
                points: question.points || 1,
              },
            }),
            correct_answers: JSON.stringify(correctAnswers),
          }
        }),
      }

      normalizedTest.parts.push(partData)
    }
  }

  // Hàm map question_type string sang type_id
  function getQuestionTypeId(typeString) {
    const typeMap = {
      "Một đáp án": 1,
      "Nhiều đáp án": 2,
      "Ghép nối": 3,
      "Ghi nhãn Bản đồ/Sơ đồ": 4,
      "Hoàn thành ghi chú": 5,
      "Hoàn thành bảng/biểu mẫu": 6,
      "Hoàn thành lưu đồ": 7,
    }

    return typeMap[typeString] || 1 // Mặc định là type 1 nếu không tìm thấy
  }

  return normalizedTest
}

// Cải thiện hàm saveTestToServer với xử lý lỗi chi tiết
async function saveTestToServer(testData) {
  try {
    // Kiểm tra kết nối internet
    if (!navigator.onLine) {
      console.log("Không có kết nối internet, lưu offline")
      const offlineKey = saveTestOffline(testData)
      showNotification(
        "Không có kết nối internet. Bài kiểm tra đã được lưu offline và sẽ được đồng bộ khi có kết nối.",
        "warning",
      )
      return { success: false, offlineKey, message: "Đã lưu offline" }
    }

    // Show loading notification
    showNotification("Đang kết nối với máy chủ...", "info")

    // Make sure we're using the global test object
    const globalTest = window.test || testData

    console.log("Test data received by saveTestToServer:", testData)
    console.log("Global test object:", globalTest)

    // Check if the test data has questions
    let hasQuestions = false
    let totalQuestions = 0

    for (let i = 1; i <= 4; i++) {
      if (globalTest[`part${i}`] && globalTest[`part${i}`].length > 0) {
        hasQuestions = true
        totalQuestions += globalTest[`part${i}`].length
      }
    }

    console.log(`Test has questions: ${hasQuestions}, Total questions: ${totalQuestions}`)

    if (!hasQuestions) {
      console.warn("Không tìm thấy câu hỏi trong dữ liệu bài kiểm tra, đang cố gắng tạo lại từ DOM")

      // Try to rebuild from DOM
      for (let i = 1; i <= 4; i++) {
        const partElement = document.getElementById(`part${i}`)
        if (partElement) {
          const questionElements = partElement.querySelectorAll(".question")

          if (questionElements.length > 0) {
            console.log(`Tìm thấy ${questionElements.length} câu hỏi trong phần ${i} từ DOM`)

            // Initialize the part array if it doesn't exist
            if (!globalTest[`part${i}`]) {
              globalTest[`part${i}`] = []
            }

            // Add missing questions
            questionElements.forEach((questionElement, index) => {
              if (!globalTest[`part${i}`][index]) {
                // Try to determine the question type
                const typeElement = questionElement.querySelector("h3")
                const questionType = typeElement
                  ? typeElement.textContent.replace(/^[\s\S]*?(\w+\s+\w+\s*\/?\s*\w*)$/, "$1").trim()
                  : "Unknown Type"

                // Extract question data based on type
                let questionData = null

                switch (questionType) {
                  case "Một đáp án":
                    questionData = extractOneAnswerDataFromDOM(questionElement)
                    break
                  case "Nhiều đáp án":
                    questionData = extractMultipleAnswerDataFromDOM(questionElement)
                    break
                  case "Ghép nối":
                    questionData = extractMatchingDataFromDOM(questionElement)
                    break
                  case "Ghi nhãn Bản đồ/Sơ đồ":
                    questionData = extractPlanMapDiagramDataFromDOM(questionElement)
                    break
                  case "Hoàn thành ghi chú":
                    questionData = extractNoteCompletionDataFromDOM(questionElement)
                    break
                  case "Hoàn thành bảng/biểu mẫu":
                    questionData = extractFormTableCompletionDataFromDOM(questionElement)
                    break
                  case "Hoàn thành lưu đồ":
                    questionData = extractFlowChartCompletionDataFromDOM(questionElement)
                    break
                  default:
                    questionData = {
                      type: questionType,
                      content: ["Question content from DOM"],
                      correctAnswers: ["Answer from DOM"],
                    }
                }

                // Add the question to the test part
                globalTest[`part${i}`][index] = questionData
                console.log(`Đã thêm câu hỏi từ DOM vào phần ${i} tại vị trí ${index}`)
              }
            })
          }
        }
      }
    }

    // Validate test data before sending
    for (let i = 1; i <= 4; i++) {
      if (globalTest[`part${i}`] && globalTest[`part${i}`].length > 0) {
        globalTest[`part${i}`].forEach((question, index) => {
          // Ensure content is an array
          if (!Array.isArray(question.content)) {
            question.content = ["Missing content"]
            console.warn(`Đã sửa nội dung không hợp lệ cho câu hỏi ${index} trong phần ${i}`)
          }

          // Ensure correctAnswers exists
          if (!question.correctAnswers) {
            question.correctAnswers = ["Missing answer"]
            console.warn(`Đã sửa câu trả lời bị thiếu cho câu hỏi ${index} trong phần ${i}`)
          }
        })
      }
    }

    // Thêm thông tin version nếu chưa có
    if (!globalTest.version) {
      globalTest.version = 1
    } else if (globalTest.isNewVersion) {
      // Nếu đây là phiên bản mới của bài test đã tồn tại
      globalTest.version = (Number.parseInt(globalTest.version) || 1) + 1
    }

    // Normalize data before sending
    const normalizedData = normalizeTestData(globalTest)
    console.log("Dữ liệu đã chuẩn hóa sẽ được gửi:", normalizedData)

    // Validate normalized data
    if (!normalizedData.title) {
      throw new Error("Tiêu đề bài kiểm tra không được để trống")
    }

    if (!normalizedData.parts || normalizedData.parts.length === 0) {
      throw new Error("Bài kiểm tra phải có ít nhất một phần với câu hỏi")
    }

    // Hiển thị thông báo đang lưu
    showNotification("Đang lưu bài kiểm tra...", "info")

    // Kiểm tra token xác thực
    const token = getToken()
    if (!token) {
      console.warn("Không tìm thấy token xác thực, tiếp tục mà không có xác thực")
    }

    // Make API request
    const response = await fetchWithAuth(`${API_URL}/tests`, {
      method: globalTest.id ? "PUT" : "POST", // Sử dụng PUT nếu đã có ID, ngược lại sử dụng POST
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(normalizedData),
    })

    // Kiểm tra lỗi HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Không thể phân tích phản hồi từ server" }))

      // Xử lý các mã lỗi cụ thể
      if (response.status === 401) {
        removeToken() // Xóa token không hợp lệ
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
      } else if (response.status === 403) {
        throw new Error("Bạn không có quyền thực hiện thao tác này.")
      } else if (response.status === 404) {
        throw new Error("Không tìm thấy tài nguyên yêu cầu.")
      } else if (response.status === 500) {
        throw new Error("Lỗi máy chủ: " + (errorData.message || "Không xác định"))
      }

      throw new Error(errorData.message || "Không thể lưu bài kiểm tra")
    }

    const result = await response.json()
    showNotification(
      `Bài kiểm tra "${normalizedData.vietnamese_name || normalizedData.title}" đã được lưu thành công!`,
      "success",
    )

    // Cập nhật ID cho bài test nếu là bài mới
    if (result.testId && !globalTest.id) {
      globalTest.id = result.testId
      window.test = globalTest
    }

    return { success: true, ...result }
  } catch (error) {
    console.error("Lỗi khi lưu bài kiểm tra lên máy chủ:", error)

    // Lưu log lỗi chi tiết
    logError("save_test_error", {
      message: error.message,
      testData: JSON.stringify(testData),
      timestamp: new Date().toISOString(),
    })

    // Lưu bản nháp offline nếu có lỗi kết nối
    if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
      const offlineKey = saveTestOffline(testData)
      showNotification("Không thể kết nối đến máy chủ. Bài kiểm tra đã được lưu offline.", "warning")
      return { success: false, offlineKey, message: "Đã lưu offline" }
    } else {
      showNotification(`Lỗi: ${error.message}`, "error")
    }

    throw error
  }
}

// Hàm lưu bài kiểm tra offline
function saveTestOffline(testData) {
  try {
    const timestamp = new Date().toISOString()
    const offlineKey = `offline_test_${timestamp}`
    const offlineData = {
      test: testData,
      timestamp: timestamp,
      synced: false,
    }

    localStorage.setItem(offlineKey, JSON.stringify(offlineData))

    // Lưu danh sách các bài test offline
    const offlineTests = JSON.parse(localStorage.getItem("offline_tests") || "[]")
    offlineTests.push(offlineKey)
    localStorage.setItem("offline_tests", JSON.stringify(offlineTests))

    console.log("Đã lưu bài kiểm tra offline:", offlineKey)
    return offlineKey
  } catch (error) {
    console.error("Lỗi khi lưu bài kiểm tra offline:", error)
    return null
  }
}

// Hàm ghi log lỗi
function logError(type, data) {
  try {
    const errorLogs = JSON.parse(localStorage.getItem("error_logs") || "[]")
    errorLogs.push({
      type,
      data,
      timestamp: new Date().toISOString(),
    })

    // Giới hạn số lượng log lỗi
    if (errorLogs.length > 100) {
      errorLogs.shift() // Xóa log cũ nhất
    }

    localStorage.setItem("error_logs", JSON.stringify(errorLogs))
  } catch (error) {
    console.error("Lỗi khi ghi log:", error)
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
    const response = await fetchWithAuth(`${API_URL}/tests`)

    if (!response.ok) {
      throw new Error("Không thể lấy danh sách bài kiểm tra")
    }

    return await response.json()
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài kiểm tra:", error)
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

// Thêm hàm đồng bộ hóa dữ liệu offline
async function syncOfflineTests() {
  try {
    // Kiểm tra kết nối internet
    if (!navigator.onLine) {
      console.log("Không có kết nối internet, bỏ qua đồng bộ hóa")
      return { success: false, message: "Không có kết nối internet" }
    }

    // Lấy danh sách bài test offline
    const offlineTests = JSON.parse(localStorage.getItem("offline_tests") || "[]")
    if (offlineTests.length === 0) {
      console.log("Không có bài test offline cần đồng bộ")
      return { success: true, message: "Không có bài test offline" }
    }

    console.log(`Tìm thấy ${offlineTests.length} bài test offline cần đồng bộ`)
    showNotification(`Đang đồng bộ ${offlineTests.length} bài test offline...`, "info")

    let syncedCount = 0
    let failedCount = 0

    // Đồng bộ từng bài test
    for (const offlineKey of offlineTests) {
      try {
        const offlineData = JSON.parse(localStorage.getItem(offlineKey) || "null")
        if (!offlineData || offlineData.synced) continue

        console.log(`Đang đồng bộ bài test: ${offlineKey}`)

        // Gửi bài test lên server
        const result = await saveTestToServer(offlineData.test)

        if (result && result.testId) {
          // Đánh dấu đã đồng bộ
          offlineData.synced = true
          offlineData.syncedAt = new Date().toISOString()
          offlineData.serverId = result.testId
          localStorage.setItem(offlineKey, JSON.stringify(offlineData))
          syncedCount++
        } else {
          failedCount++
        }
      } catch (error) {
        console.error(`Lỗi khi đồng bộ bài test ${offlineKey}:`, error)
        failedCount++
      }
    }

    // Cập nhật danh sách bài test offline
    const updatedOfflineTests = offlineTests.filter((key) => {
      const data = JSON.parse(localStorage.getItem(key) || "null")
      return data && !data.synced
    })
    localStorage.setItem("offline_tests", JSON.stringify(updatedOfflineTests))

    // Hiển thị thông báo kết quả
    if (syncedCount > 0) {
      showNotification(`Đã đồng bộ thành công ${syncedCount} bài test offline`, "success")
    }

    if (failedCount > 0) {
      showNotification(`Không thể đồng bộ ${failedCount} bài test offline`, "warning")
    }

    return {
      success: true,
      syncedCount,
      failedCount,
      remaining: updatedOfflineTests.length,
    }
  } catch (error) {
    console.error("Lỗi khi đồng bộ bài test offline:", error)
    showNotification("Lỗi khi đồng bộ bài test offline", "error")
    return { success: false, error: error.message }
  }
}

// Thêm hàm kiểm tra và đồng bộ tự động
function setupAutoSync() {
  // Đồng bộ khi có kết nối internet trở lại
  window.addEventListener("online", () => {
    console.log("Kết nối internet đã trở lại, bắt đầu đồng bộ")
    showNotification("Đã kết nối lại internet, đang đồng bộ dữ liệu...", "info")
    syncOfflineTests()
  })

  // Kiểm tra và đồng bộ khi tải trang
  if (navigator.onLine) {
    // Đợi 5 giây sau khi tải trang để đồng bộ
    setTimeout(() => {
      syncOfflineTests()
    }, 5000)
  }
}

// Gọi hàm thiết lập đồng bộ tự động
setupAutoSync()

// Thêm hàm xử lý upload file âm thanh
async function uploadAudioFile(file, partNumber) {
  try {
    if (!file) {
      throw new Error("Không có file âm thanh được chọn")
    }

    // Kiểm tra loại file
    if (!file.type.startsWith("audio/")) {
      throw new Error("File không phải là file âm thanh hợp lệ")
    }

    // Kiểm tra kích thước file (giới hạn 50MB)
    const MAX_SIZE = 50 * 1024 * 1024 // 50MB
    if (file.size > MAX_SIZE) {
      throw new Error("Kích thước file vượt quá giới hạn 50MB")
    }

    // Hiển thị thông báo đang tải lên
    showNotification(`Đang tải lên file âm thanh cho phần ${partNumber}...`, "info")

    // Hiển thị thanh tiến trình
    const progressContainer = document.createElement("div")
    progressContainer.className = "upload-progress-container"
    progressContainer.innerHTML = `
      <div class="upload-progress-label">Đang tải lên: ${file.name}</div>
      <div class="upload-progress-bar-container">
        <div class="upload-progress-bar" style="width: 0%"></div>
      </div>
      <div class="upload-progress-percentage">0%</div>
    `
    document.body.appendChild(progressContainer)

    // Tạo FormData
    const formData = new FormData()
    formData.append("audio", file)
    formData.append("partNumber", partNumber)

    // Tạo XMLHttpRequest để theo dõi tiến trình
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Xử lý sự kiện tiến trình
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          const progressBar = progressContainer.querySelector(".upload-progress-bar")
          const progressPercentage = progressContainer.querySelector(".upload-progress-percentage")

          progressBar.style.width = percentComplete + "%"
          progressPercentage.textContent = percentComplete + "%"
        }
      })

      // Xử lý khi hoàn thành
      xhr.addEventListener("load", () => {
        // Xóa thanh tiến trình
        document.body.removeChild(progressContainer)

        if (xhr.status >= 200 && xhr.status < 300) {
          // Thành công
          const response = JSON.parse(xhr.responseText)
          showNotification(`Đã tải lên file âm thanh cho phần ${partNumber} thành công`, "success")
          resolve(response.audioUrl)
        } else {
          // Lỗi HTTP
          let errorMessage = "Không thể tải lên file âm thanh"
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            errorMessage = errorResponse.message || errorMessage
          } catch (e) {
            // Không thể phân tích phản hồi JSON
          }
          reject(new Error(errorMessage))
        }
      })

      // Xử lý lỗi
      xhr.addEventListener("error", () => {
        // Xóa thanh tiến trình
        document.body.removeChild(progressContainer)
        reject(new Error("Lỗi kết nối khi tải lên file"))
      })

      // Xử lý hủy
      xhr.addEventListener("abort", () => {
        // Xóa thanh tiến trình
        document.body.removeChild(progressContainer)
        reject(new Error("Quá trình tải lên đã bị hủy"))
      })

      // Gửi request
      xhr.open("POST", `${API_URL}/upload/audio`)

      // Thêm token xác thực nếu có
      const token = getToken()
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`)
      }

      xhr.send(formData)
    })
  } catch (error) {
    console.error("Lỗi khi tải lên file âm thanh:", error)
    showNotification(`Lỗi khi tải lên file âm thanh: ${error.message}`, "error")

    // Lưu log lỗi
    logError("upload_audio_error", {
      message: error.message,
      partNumber,
      timestamp: new Date().toISOString(),
    })

    throw error
  }
}

// Thêm hàm xử lý upload file hình ảnh cho câu hỏi
async function uploadImageFile(file, partNumber, questionIndex) {
  try {
    if (!file) {
      throw new Error("Không có file hình ảnh được chọn")
    }

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      throw new Error("File không phải là file hình ảnh hợp lệ")
    }

    // Kiểm tra kích thước file (giới hạn 10MB)
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      throw new Error("Kích thước file vượt quá giới hạn 10MB")
    }

    // Hiển thị thông báo đang tải lên
    showNotification(`Đang tải lên hình ảnh cho câu hỏi ${questionIndex + 1} phần ${partNumber}...`, "info")

    // Tạo FormData
    const formData = new FormData()
    formData.append("image", file)
    formData.append("partNumber", partNumber)
    formData.append("questionIndex", questionIndex)

    // Gửi request
    const response = await fetchWithAuth(`${API_URL}/upload/image`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Không thể tải lên hình ảnh")
    }

    const result = await response.json()

    // Hiển thị thông báo thành công
    showNotification(`Đã tải lên hình ảnh thành công`, "success")

    // Trả về URL của hình ảnh
    return result.imageUrl
  } catch (error) {
    console.error("Lỗi khi tải lên hình ảnh:", error)
    showNotification(`Lỗi khi tải lên hình ảnh: ${error.message}`, "error")

    // Lưu log lỗi
    logError("upload_image_error", {
      message: error.message,
      partNumber,
      questionIndex,
      timestamp: new Date().toISOString(),
    })

    throw error
  }
}

// Thêm hàm xử lý vấn đề third-party cookies
function handleThirdPartyCookies() {
  // Kiểm tra xem cookies có bị chặn không
  function checkCookiesEnabled() {
    try {
      // Thử set một cookie test
      document.cookie = "testcookie=1; SameSite=None; Secure"
      const cookieEnabled = document.cookie.indexOf("testcookie") !== -1

      // Xóa cookie test
      document.cookie = "testcookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure"

      return cookieEnabled
    } catch (e) {
      return false
    }
  }

  // Nếu cookies bị chặn, hiển thị cảnh báo
  if (!checkCookiesEnabled()) {
    console.warn("Cookies bị chặn, có thể gây ra vấn đề với xác thực")

    // Tạo banner cảnh báo
    const warningBanner = document.createElement("div")
    warningBanner.style.position = "fixed"
    warningBanner.style.top = "0"
    warningBanner.style.left = "0"
    warningBanner.style.width = "100%"
    warningBanner.style.padding = "10px"
    warningBanner.style.backgroundColor = "#fff3cd"
    warningBanner.style.color = "#856404"
    warningBanner.style.textAlign = "center"
    warningBanner.style.zIndex = "9999"
    warningBanner.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)"

    warningBanner.innerHTML = `
      <strong>Cảnh báo:</strong> Cookies của bên thứ ba đang bị chặn. 
      Điều này có thể gây ra vấn đề với đăng nhập và lưu bài kiểm tra. 
      <div style="margin-top: 5px;">
        <strong>Cách khắc phục:</strong>
        <ul style="text-align: left; display: inline-block; margin: 5px 0;">
          <li>Chrome: Cài đặt > Quyền riêng tư và bảo mật > Cookies > Cho phép tất cả cookies</li>
          <li>Firefox: Cài đặt > Quyền riêng tư & Bảo mật > Cookies > Chấp nhận cookies từ các trang web</li>
          <li>Safari: Tùy chọn > Quyền riêng tư > Cookies và dữ liệu trang web > Luôn cho phép</li>
        </ul>
      </div>
      <button id="dismiss-cookie-warning" style="margin-left: 10px; padding: 2px 8px; cursor: pointer;">Đóng</button>
      <button id="use-local-storage" style="margin-left: 10px; padding: 2px 8px; cursor: pointer;">Sử dụng localStorage</button>
    `

    document.body.appendChild(warningBanner)

    // Xử lý nút đóng
    document.getElementById("dismiss-cookie-warning").addEventListener("click", () => {
      warningBanner.style.display = "none"
    })

    // Xử lý nút sử dụng localStorage
    document.getElementById("use-local-storage").addEventListener("click", () => {
      localStorage.setItem("use_local_storage", "true")
      warningBanner.style.display = "none"
      showNotification("Đã chuyển sang sử dụng localStorage thay thế cho cookies", "info")
    })

    // Sử dụng localStorage thay thế nếu đã được chọn trước đó
    if (localStorage.getItem("use_local_storage") === "true") {
      console.log("Đang sử dụng localStorage thay thế cho cookies")
    }
  }
}

// Gọi hàm xử lý third-party cookies
handleThirdPartyCookies()

/**
 * Hàm kiểm tra kết nối đến API
 * @returns {Promise<boolean>} Kết quả kiểm tra
 */
async function checkApiConnection() {
  try {
    const response = await fetch(`${API_URL}/system/health`, {
      method: "GET",
      timeout: 5000,
    })
    return response.ok
  } catch (error) {
    console.error("Lỗi kiểm tra kết nối API:", error.message)
    return false
  }
}

/**
 * Hàm kiểm tra kết nối đến database
 * @returns {Promise<Object>} Kết quả kiểm tra
 */
async function checkDatabaseConnection() {
  try {
    const response = await fetch(`${API_URL}/system/db-check`, {
      method: "GET",
      timeout: 5000,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: data.success,
      message: data.message,
      details: data.details,
    }
  } catch (error) {
    console.error("Lỗi kiểm tra kết nối database:", error.message)
    return {
      success: false,
      message: "Kết nối database thất bại",
      error: error.message,
    }
  }
}

/**
 * Hàm hiển thị trạng thái API
 * @param {string} containerId - ID của phần tử HTML để hiển thị trạng thái
 */
async function displayApiStatus(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  // Kiểm tra kết nối internet
  if (!navigator.onLine) {
    container.className = "api-status-container api-status-offline"
    container.innerHTML = `<i class="fas fa-wifi"></i> Offline - Không có kết nối internet`
    return
  }

  // Kiểm tra kết nối API
  const apiConnected = await checkApiConnection()

  if (!apiConnected) {
    container.className = "api-status-container api-status-offline"
    container.innerHTML = `<i class="fas fa-server"></i> API không khả dụng`
    return
  }

  // Kiểm tra kết nối database
  const dbStatus = await checkDatabaseConnection()

  if (!dbStatus.success) {
    container.className = "api-status-container api-status-offline"
    container.innerHTML = `<i class="fas fa-database"></i> Database không khả dụng`
    return
  }

  // Kiểm tra dữ liệu offline cần đồng bộ
  const offlineData = localStorage.getItem("offlineTests")

  if (offlineData) {
    const offlineTests = JSON.parse(offlineData)

    if (offlineTests && offlineTests.length > 0) {
      container.className = "api-status-container api-status-syncing"
      container.innerHTML = `<i class="fas fa-sync"></i> Đang đồng bộ ${offlineTests.length} bài kiểm tra`
      return
    }
  }

  // Tất cả đều ổn
  container.className = "api-status-container api-status-online"
  container.innerHTML = `<i class="fas fa-check-circle"></i> Kết nối đầy đủ`
}

// Xuất các hàm để sử dụng trong các file khác
window.checkApiConnection = checkApiConnection
window.checkDatabaseConnection = checkDatabaseConnection
window.displayApiStatus = displayApiStatus

// Xuất các hàm để sử dụng trong các file khác
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
window.uploadAudioFile = uploadAudioFile
window.uploadImageFile = uploadImageFile
window.syncOfflineTests = syncOfflineTests
