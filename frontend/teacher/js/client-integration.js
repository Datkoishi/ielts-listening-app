// Tích hợp frontend với backend API
const API_URL = "/api"
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

// Lưu bài kiểm tra lên server
async function saveTestToServer(testData) {
  try {
    // Show loading notification
    showNotification("Connecting to server...", "info")

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
      console.warn("No questions found in test data, attempting to rebuild from DOM")

      // Try to rebuild from DOM
      for (let i = 1; i <= 4; i++) {
        const partElement = document.getElementById(`part${i}`)
        if (partElement) {
          const questionElements = partElement.querySelectorAll(".question")

          if (questionElements.length > 0) {
            console.log(`Found ${questionElements.length} questions in part${i} DOM`)

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
                console.log(`Added question from DOM to part${i} at index ${index}`)
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
            console.warn(`Fixed invalid content for question ${index} in part${i}`)
          }

          // Ensure correctAnswers exists
          if (!question.correctAnswers) {
            question.correctAnswers = ["Missing answer"]
            console.warn(`Fixed missing correctAnswers for question ${index} in part${i}`)
          }
        })
      }
    }

    // Normalize data before sending
    const normalizedData = normalizeTestData(globalTest)
    console.log("Normalized data to be sent:", normalizedData)

    // Make API request
    const response = await fetchWithAuth(`${API_URL}/tests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to save test")
    }

    return await response.json()
  } catch (error) {
    console.error("Error saving test to server:", error)

    // If there's a network error or server is down, provide a fallback
    if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
      throw new Error("Cannot connect to server. Please check your internet connection.")
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
    const optionsList = questionContent.querySelector("ul")
    if (optionsList) {
      const optionItems = optionsList.querySelectorAll("li")
      optionItems.forEach((item) => {
        // Remove the "(Đúng)" text if present
        const optionText = item.textContent.replace(/$$Đúng$$$/, "").trim()
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

function defaultQuestionData(type) {
  return {
    type: type,
    content: ["Default question"],
    correctAnswers: type === "Nhiều đáp án" ? ["Default answer"] : "Default answer",
  }
}

// Add similar extraction functions for other question types
function extractMultipleAnswerDataFromDOM(questionElement) {
  // Implement your logic here
  return defaultQuestionData("Nhiều đáp án")
}

function extractMatchingDataFromDOM(questionElement) {
  // Implement your logic here
  return defaultQuestionData("Ghép nối")
}

function extractPlanMapDiagramDataFromDOM(questionElement) {
  // Implement your logic here
  return defaultQuestionData("Ghi nhãn Bản đồ/Sơ đồ")
}

function extractNoteCompletionDataFromDOM(questionElement) {
  // Implement your logic here
  return defaultQuestionData("Hoàn thành ghi chú")
}

function extractFormTableCompletionDataFromDOM(questionElement) {
  // Implement your logic here
  return defaultQuestionData("Hoàn thành bảng/biểu mẫu")
}

function extractFlowChartCompletionDataFromDOM(questionElement) {
  // Implement your logic here
  return defaultQuestionData("Hoàn thành lưu đồ")
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
