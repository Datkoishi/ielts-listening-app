/**
 * API Service - Xử lý tất cả các yêu cầu API và chuẩn hóa dữ liệu
 */

// Cấu hình API
const API_BASE_URL = "http://localhost:3000/api"

// Lưu trữ token JWT
let authToken = localStorage.getItem("authToken")

/**
 * Thiết lập token xác thực
 * @param {string} token - JWT token
 */
export function setAuthToken(token) {
  authToken = token
  localStorage.setItem("authToken", token)
}

/**
 * Xóa token xác thực
 */
export function clearAuthToken() {
  authToken = null
  localStorage.removeItem("authToken")
}

/**
 * Tạo headers chuẩn cho các yêu cầu API
 * @returns {Object} Headers cho fetch API
 */
function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
  }

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`
  }

  return headers
}

/**
 * Xử lý phản hồi từ API
 * @param {Response} response - Phản hồi fetch API
 * @returns {Promise} Dữ liệu đã xử lý
 */
async function handleResponse(response) {
  const data = await response.json()

  if (!response.ok) {
    // Xử lý lỗi xác thực
    if (response.status === 401) {
      clearAuthToken()
      // Chuyển hướng đến trang đăng nhập nếu cần
      // window.location.href = '/login';
    }

    // Ném lỗi với thông tin chi tiết
    const error = {
      status: response.status,
      message: data.message || "Đã xảy ra lỗi",
      details: data.details || {},
    }
    throw error
  }

  return data
}

/**
 * Chuẩn hóa dữ liệu câu hỏi trước khi gửi đến server
 * @param {Object} question - Dữ liệu câu hỏi
 * @returns {Object} Dữ liệu câu hỏi đã chuẩn hóa
 */
export function normalizeQuestionData(question) {
  // Tạo bản sao để tránh thay đổi dữ liệu gốc
  const normalizedQuestion = { ...question }

  // Đảm bảo các trường bắt buộc
  normalizedQuestion.id = normalizedQuestion.id || generateUniqueId()
  normalizedQuestion.type = normalizedQuestion.type || "multiple-choice"
  normalizedQuestion.text = normalizedQuestion.text || ""

  // Xử lý các loại câu hỏi khác nhau
  switch (normalizedQuestion.type) {
    case "multiple-choice":
      normalizedQuestion.options = Array.isArray(normalizedQuestion.options) ? normalizedQuestion.options : []
      normalizedQuestion.correctAnswer = normalizedQuestion.correctAnswer || ""
      break

    case "fill-in-the-blank":
      normalizedQuestion.answers = Array.isArray(normalizedQuestion.answers) ? normalizedQuestion.answers : []
      break

    case "matching":
      normalizedQuestion.pairs = Array.isArray(normalizedQuestion.pairs) ? normalizedQuestion.pairs : []
      break

    case "plan-map-diagram":
      // Đảm bảo dữ liệu hình ảnh và vị trí được định dạng đúng
      normalizedQuestion.imageUrl = normalizedQuestion.imageUrl || ""
      normalizedQuestion.locations = Array.isArray(normalizedQuestion.locations)
        ? normalizedQuestion.locations.map((loc) => ({
            id: loc.id || generateUniqueId(),
            label: loc.label || "",
            x: Number.parseFloat(loc.x) || 0,
            y: Number.parseFloat(loc.y) || 0,
            answer: loc.answer || "",
          }))
        : []
      break
  }

  return normalizedQuestion
}

/**
 * Chuẩn hóa dữ liệu bài kiểm tra trước khi gửi đến server
 * @param {Object} test - Dữ liệu bài kiểm tra
 * @returns {Object} Dữ liệu bài kiểm tra đã chuẩn hóa
 */
export function normalizeTestData(test) {
  // Tạo bản sao để tránh thay đổi dữ liệu gốc
  const normalizedTest = { ...test }

  // Đảm bảo các trường bắt buộc
  normalizedTest.id = normalizedTest.id || generateUniqueId()
  normalizedTest.title = normalizedTest.title || "Untitled Test"
  normalizedTest.description = normalizedTest.description || ""
  normalizedTest.audioUrl = normalizedTest.audioUrl || ""

  // Chuẩn hóa các phần
  normalizedTest.sections = Array.isArray(normalizedTest.sections)
    ? normalizedTest.sections.map((section) => ({
        id: section.id || generateUniqueId(),
        title: section.title || "Untitled Section",
        description: section.description || "",
        questions: Array.isArray(section.questions) ? section.questions.map((q) => normalizeQuestionData(q)) : [],
      }))
    : []

  return normalizedTest
}

/**
 * Kiểm tra tính hợp lệ của dữ liệu câu hỏi
 * @param {Object} question - Dữ liệu câu hỏi
 * @returns {Object} Kết quả kiểm tra {isValid, errors}
 */
export function validateQuestion(question) {
  const errors = []

  // Kiểm tra các trường bắt buộc
  if (!question.text || question.text.trim() === "") {
    errors.push("Nội dung câu hỏi không được để trống")
  }

  // Kiểm tra theo loại câu hỏi
  switch (question.type) {
    case "Một đáp án":
      if (!Array.isArray(question.options) || question.options.length < 2) {
        errors.push("Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn")
      }
      if (!question.correctAnswer) {
        errors.push("Câu trả lời đúng không được để trống")
      } else if (Array.isArray(question.options) && !question.options.includes(question.correctAnswer)) {
        errors.push("Câu trả lời đúng phải là một trong các lựa chọn")
      }
      break

    case "Nhiều đáp án":
      if (!Array.isArray(question.options) || question.options.length < 2) {
        errors.push("Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn")
      }
      if (!Array.isArray(question.correctAnswers) || question.correctAnswers.length === 0) {
        errors.push("Câu hỏi nhiều đáp án phải có ít nhất 1 câu trả lời đúng")
      } else if (Array.isArray(question.options) && Array.isArray(question.correctAnswers)) {
        // Kiểm tra xem tất cả các đáp án đúng có nằm trong danh sách lựa chọn không
        for (const answer of question.correctAnswers) {
          if (!question.options.includes(answer)) {
            errors.push(`Đáp án "${answer}" không có trong danh sách lựa chọn`)
          }
        }
      }
      break

    case "Ghép nối":
      if (!Array.isArray(question.pairs) || question.pairs.length < 2) {
        errors.push("Câu hỏi ghép đôi phải có ít nhất 2 cặp")
      }
      break

    case "Ghi nhãn Bản đồ/Sơ đồ":
      if (!question.imageUrl) {
        errors.push("Câu hỏi bản đồ/sơ đồ phải có hình ảnh")
      }
      if (!Array.isArray(question.locations) || question.locations.length === 0) {
        errors.push("Câu hỏi bản đồ/sơ đồ phải có ít nhất 1 vị trí")
      } else {
        // Kiểm tra từng vị trí
        question.locations.forEach((loc, index) => {
          if (!loc.label) {
            errors.push(`Vị trí #${index + 1} phải có nhãn`)
          }
          if (loc.x === undefined || loc.y === undefined) {
            errors.push(`Vị trí #${index + 1} phải có tọa độ x, y`)
          }
          if (!loc.answer) {
            errors.push(`Vị trí #${index + 1} phải có câu trả lời`)
          }
        })
      }
      break

    case "Hoàn thành ghi chú":
      if (!Array.isArray(question.answers) || question.answers.length === 0) {
        errors.push("Câu hỏi điền vào chỗ trống phải có ít nhất 1 câu trả lời")
      }
      if (!question.noteText || question.noteText.trim() === "") {
        errors.push("Nội dung ghi chú không được để trống")
      } else {
        // Kiểm tra xem có đủ chỗ trống trong nội dung không
        const blankCount = (question.noteText.match(/\[BLANK\]/g) || []).length
        if (Array.isArray(question.answers) && blankCount !== question.answers.length) {
          errors.push(
            `Số lượng chỗ trống (${blankCount}) không khớp với số lượng câu trả lời (${question.answers.length})`,
          )
        }
      }
      break

    case "Hoàn thành bảng/biểu mẫu":
      if (!Array.isArray(question.answers) || question.answers.length === 0) {
        errors.push("Câu hỏi hoàn thành bảng/biểu mẫu phải có ít nhất 1 câu trả lời")
      }
      if (!question.tableContent || question.tableContent.trim() === "") {
        errors.push("Nội dung bảng/biểu mẫu không được để trống")
      }
      break

    case "Hoàn thành lưu đồ":
      if (!Array.isArray(question.answers) || question.answers.length === 0) {
        errors.push("Câu hỏi hoàn thành lưu đồ phải có ít nhất 1 câu trả lời")
      }
      if (!Array.isArray(question.flowItems) || question.flowItems.length === 0) {
        errors.push("Câu hỏi hoàn thành lưu đồ phải có ít nhất 1 mục")
      } else {
        // Kiểm tra xem có đủ chỗ trống trong các mục không
        let blankCount = 0
        question.flowItems.forEach((item) => {
          blankCount += (item.match(/___/g) || []).length
        })

        if (Array.isArray(question.answers) && blankCount !== question.answers.length) {
          errors.push(
            `Số lượng chỗ trống (${blankCount}) không khớp với số lượng câu trả lời (${question.answers.length})`,
          )
        }
      }
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Kiểm tra tính hợp lệ của dữ liệu bài kiểm tra
 * @param {Object} test - Dữ liệu bài kiểm tra
 * @returns {Object} Kết quả kiểm tra {isValid, errors}
 */
export function validateTest(test) {
  const errors = []

  // Kiểm tra các trường bắt buộc
  if (!test.title || test.title.trim() === "") {
    errors.push("Tiêu đề bài kiểm tra không được để trống")
  }

  if (!test.audioUrl) {
    errors.push("Bài kiểm tra phải có file âm thanh")
  }

  // Kiểm tra các phần
  if (!Array.isArray(test.sections) || test.sections.length === 0) {
    errors.push("Bài kiểm tra phải có ít nhất 1 phần")
  } else {
    // Kiểm tra từng phần
    test.sections.forEach((section, sectionIndex) => {
      if (!section.title || section.title.trim() === "") {
        errors.push(`Phần #${sectionIndex + 1} phải có tiêu đề`)
      }

      if (!Array.isArray(section.questions) || section.questions.length === 0) {
        errors.push(`Phần #${sectionIndex + 1} phải có ít nhất 1 câu hỏi`)
      } else {
        // Kiểm tra từng câu hỏi
        section.questions.forEach((question, questionIndex) => {
          const validation = validateQuestion(question)
          if (!validation.isValid) {
            validation.errors.forEach((error) => {
              errors.push(`Phần #${sectionIndex + 1}, Câu hỏi #${questionIndex + 1}: ${error}`)
            })
          }
        })
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Tạo ID duy nhất
 * @returns {string} ID duy nhất
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

/**
 * Gửi yêu cầu API
 * @param {string} endpoint - Đường dẫn API
 * @param {string} method - Phương thức HTTP
 * @param {Object} data - Dữ liệu gửi đi
 * @returns {Promise} Phản hồi từ API
 */
async function apiRequest(endpoint, method = "GET", data = null) {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const options = {
      method,
      headers: getHeaders(),
      credentials: "include", // Để xử lý cookie
    }

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)
    return await handleResponse(response)
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

/**
 * Đăng nhập người dùng
 * @param {string} email - Email
 * @param {string} password - Mật khẩu
 * @returns {Promise} Thông tin người dùng và token
 */
export async function login(email, password) {
  const data = await apiRequest("/users/login", "POST", { email, password })
  if (data.token) {
    setAuthToken(data.token)
  }
  return data
}

/**
 * Đăng xuất người dùng
 * @returns {Promise} Kết quả đăng xuất
 */
export async function logout() {
  const result = await apiRequest("/users/logout", "POST")
  clearAuthToken()
  return result
}

/**
 * Lưu bài kiểm tra
 * @param {Object} testData - Dữ liệu bài kiểm tra
 * @returns {Promise} Bài kiểm tra đã lưu
 */
export async function saveTest(testData) {
  // Chuẩn hóa dữ liệu
  const normalizedTest = normalizeTestData(testData)

  // Kiểm tra tính hợp lệ
  const validation = validateTest(normalizedTest)
  if (!validation.isValid) {
    throw {
      message: "Dữ liệu bài kiểm tra không hợp lệ",
      details: validation.errors,
    }
  }

  // Gửi yêu cầu API
  return apiRequest("/tests", "POST", normalizedTest)
}

/**
 * Cập nhật bài kiểm tra
 * @param {string} testId - ID bài kiểm tra
 * @param {Object} testData - Dữ liệu bài kiểm tra
 * @returns {Promise} Bài kiểm tra đã cập nhật
 */
export async function updateTest(testId, testData) {
  // Chuẩn hóa dữ liệu
  const normalizedTest = normalizeTestData(testData)

  // Kiểm tra tính hợp lệ
  const validation = validateTest(normalizedTest)
  if (!validation.isValid) {
    throw {
      message: "Dữ liệu bài kiểm tra không hợp lệ",
      details: validation.errors,
    }
  }

  // Gửi yêu cầu API
  return apiRequest(`/tests/${testId}`, "PUT", normalizedTest)
}

/**
 * Lấy danh sách bài kiểm tra
 * @returns {Promise} Danh sách bài kiểm tra
 */
export async function getTests() {
  return apiRequest("/tests")
}

/**
 * Lấy chi tiết bài kiểm tra
 * @param {string} testId - ID bài kiểm tra
 * @returns {Promise} Chi tiết bài kiểm tra
 */
export async function getTestById(testId) {
  return apiRequest(`/tests/${testId}`)
}

/**
 * Xóa bài kiểm tra
 * @param {string} testId - ID bài kiểm tra
 * @returns {Promise} Kết quả xóa
 */
export async function deleteTest(testId) {
  return apiRequest(`/tests/${testId}`, "DELETE")
}

/**
 * Tải lên file âm thanh
 * @param {File} audioFile - File âm thanh
 * @returns {Promise} Thông tin file đã tải lên
 */
export async function uploadAudio(audioFile) {
  const formData = new FormData()
  formData.append("audio", audioFile)

  try {
    const url = `${API_BASE_URL}/upload/audio`
    const options = {
      method: "POST",
      headers: {
        // Không thêm Content-Type vì FormData sẽ tự thêm
        Authorization: authToken ? `Bearer ${authToken}` : "",
      },
      credentials: "include",
      body: formData,
    }

    const response = await fetch(url, options)
    return await handleResponse(response)
  } catch (error) {
    console.error("Upload audio failed:", error)
    throw error
  }
}

/**
 * Tải lên file hình ảnh
 * @param {File} imageFile - File hình ảnh
 * @returns {Promise} Thông tin file đã tải lên
 */
export async function uploadImage(imageFile) {
  const formData = new FormData()
  formData.append("image", imageFile)

  try {
    const url = `${API_BASE_URL}/upload/image`
    const options = {
      method: "POST",
      headers: {
        // Không thêm Content-Type vì FormData sẽ tự thêm
        Authorization: authToken ? `Bearer ${authToken}` : "",
      },
      credentials: "include",
      body: formData,
    }

    const response = await fetch(url, options)
    return await handleResponse(response)
  } catch (error) {
    console.error("Upload image failed:", error)
    throw error
  }
}
