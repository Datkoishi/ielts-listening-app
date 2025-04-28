// Tích hợp frontend với backend API
const API_URL = (() => {
  // Determine the API URL based on the current environment
  const hostname = window.location.hostname
  const port = window.location.port

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    // For local development, use explicit port 3000 for the API
    return "http://localhost:3000/api"
  } else {
    // For production, use relative path
    return "/api"
  }
})()

console.log("Using API URL:", API_URL)

const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000 // 1 giây

// Declare showNotification (assuming it's a global function or imported)
function showNotification(message, type) {
  // Kiểm tra xem đã có thông báo nào chưa
  let notification = document.querySelector(".notification")
  if (!notification) {
    notification = document.createElement("div")
    notification.className = "notification"
    document.body.appendChild(notification)
  }

  // Thiết lập loại thông báo
  notification.className = `notification notification-${type}`
  notification.innerHTML = message
  notification.style.position = "fixed"
  notification.style.top = "20px"
  notification.style.right = "20px"
  notification.style.padding = "15px"
  notification.style.borderRadius = "5px"
  notification.style.zIndex = "1000"
  notification.style.maxWidth = "300px"
  notification.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)"

  // Thiết lập màu sắc dựa trên loại thông báo
  if (type === "success") {
    notification.style.backgroundColor = "#d4edda"
    notification.style.color = "#155724"
    notification.style.border = "1px solid #c3e6cb"
  } else if (type === "error") {
    notification.style.backgroundColor = "#f8d7da"
    notification.style.color = "#721c24"
    notification.style.border = "1px solid #f5c6cb"
  } else if (type === "warning") {
    notification.style.backgroundColor = "#fff3cd"
    notification.style.color = "#856404"
    notification.style.border = "1px solid #ffeeba"
  } else if (type === "info") {
    notification.style.backgroundColor = "#d1ecf1"
    notification.style.color = "#0c5460"
    notification.style.border = "1px solid #bee5eb"
  }

  // Tự động ẩn thông báo sau 5 giây
  setTimeout(() => {
    notification.style.opacity = "0"
    notification.style.transition = "opacity 0.5s"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 500)
  }, 5000)
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
      console.error(`Attempt ${attempts} failed:`, error)

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
    description: testData.description || "",
    vietnamese_name: testData.vietnameseName || "",
    parts: [],
  }

  // Convert parts to the format expected by the backend
  for (let i = 1; i <= 4; i++) {
    if (testData[`part${i}`] && testData[`part${i}`].length > 0) {
      normalizedTest.parts.push({
        part_number: i,
        questions: testData[`part${i}`].map((question) => ({
          question_type: question.type,
          content: JSON.stringify(question.content),
          correct_answers: JSON.stringify(question.correctAnswers),
        })),
      })
    }
  }

  return normalizedTest
}

// Test API connection before attempting to save
async function testApiConnection() {
  try {
    const response = await fetch(`${API_URL}/health`)
    if (!response.ok) {
      console.error("API health check failed:", await response.text())
      return false
    }
    console.log("API connection successful")
    return true
  } catch (error) {
    console.error("API connection test failed:", error)
    return false
  }
}

// Lưu bài kiểm tra lên server
async function saveTestToServer(testData) {
  try {
    // Show loading notification
    showNotification("Đang kết nối với máy chủ...", "info")

    // Test API connection first
    const apiConnected = await testApiConnection()
    if (!apiConnected) {
      throw new Error("Không thể kết nối đến API. Vui lòng kiểm tra kết nối mạng và máy chủ.")
    }

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

    // Normalize data before sending
    const normalizedData = normalizeTestData(globalTest)
    console.log("Dữ liệu đã chuẩn hóa sẽ được gửi:", normalizedData)

    // Make API request with detailed error handling
    const apiUrl = `${API_URL}/tests`
    console.log(`Sending request to ${apiUrl}`)

    // Use XMLHttpRequest instead of fetch for better compatibility
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", apiUrl, true)
      xhr.setRequestHeader("Content-Type", "application/json")

      // Add event listeners
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const responseData = JSON.parse(xhr.responseText)
            console.log("API Response data:", responseData)
            showNotification("Bài kiểm tra đã được lưu thành công!", "success")
            resolve(responseData)
          } catch (e) {
            console.error("Error parsing response:", e)
            reject(new Error("Invalid JSON response from server"))
          }
        } else {
          console.error("API error response:", xhr.responseText)
          let errorMessage = `HTTP error! status: ${xhr.status}`
          try {
            const errorData = JSON.parse(xhr.responseText)
            errorMessage = errorData.message || errorMessage
          } catch (e) {
            // Not JSON, use text
          }
          reject(new Error(errorMessage))
        }
      }

      xhr.onerror = () => {
        console.error("Network error occurred")
        reject(new Error("Network error occurred. Please check your connection and server status."))
      }

      xhr.ontimeout = () => {
        console.error("Request timed out")
        reject(new Error("Request timed out. Server may be unavailable."))
      }

      // Send the request
      xhr.send(JSON.stringify(normalizedData))
    })
      .then((responseData) => {
        return responseData
      })
      .catch((error) => {
        console.error("Lỗi chi tiết khi lưu bài kiểm tra:", error)
        showNotification(`Lỗi: ${error.message}`, "error")
        throw error
      })
  } catch (error) {
    console.error("Lỗi chi tiết khi lưu bài kiểm tra:", error)
    showNotification(`Lỗi: ${error.message}`, "error")

    // If there's a network error or server is down, provide a fallback
    if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
      throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn.")
    }

    throw error
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
    let correctAnswer = null
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
    if (!correctAnswer) {
      correctAnswer = options[0] || "Default answer"
      const correctAnswerText = Array.from(paragraphs).find((p) => p.textContent.includes("Đáp án đúng:"))
      if (correctAnswerText) {
        correctAnswer = correctAnswerText.textContent.replace("Đáp án đúng:", "").trim()
      }
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
      const answer = item.textContent.replace("Đáp án:", "").trim() || (index + 1).toString()
      const answer_value = item.textContent.replace("Đáp án:", "").trim() || `Answer ${index + 1}`

      blanks.push(blankNumber)
      answers.push(answer_value)
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
    // Test API connection first
    const apiConnected = await testApiConnection()
    if (!apiConnected) {
      throw new Error("Không thể kết nối đến API. Vui lòng kiểm tra kết nối mạng và máy chủ.")
    }

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
    // Test API connection first
    const apiConnected = await testApiConnection()
    if (!apiConnected) {
      throw new Error("Không thể kết nối đến API. Vui lòng kiểm tra kết nối mạng và máy chủ.")
    }

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
    // Test API connection first
    const apiConnected = await testApiConnection()
    if (!apiConnected) {
      throw new Error("Không thể kết nối đến API. Vui lòng kiểm tra kết nối mạng và máy chủ.")
    }

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
    // Test API connection first
    const apiConnected = await testApiConnection()
    if (!apiConnected) {
      throw new Error("Không thể kết nối đến API. Vui lòng kiểm tra kết nối mạng và máy chủ.")
    }

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
window.testApiConnection = testApiConnection

// Log API URL on load for debugging
console.log("client-integration.js loaded. API URL:", API_URL)
