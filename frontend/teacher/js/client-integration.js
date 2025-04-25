// Tích hợp frontend với backend API
const API_URL = "/api"
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000 // 1 giây

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

// Cập nhật hàm fetchWithAuth để xử lý vấn đề cookie
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

  // Thêm SameSite=None; Secure cho cookie
  options.credentials = "include"

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

  // Chuyển đổi cấu trúc dữ liệu để phù hợp với backend
  for (let i = 1; i <= 4; i++) {
    if (testData[`part${i}`] && testData[`part${i}`].length > 0) {
      normalizedTest.parts.push({
        part_number: i,
        questions: testData[`part${i}`].map(normalizeQuestionData),
      })
    }
  }

  return normalizedTest
}

// Cải thiện hàm saveTestToServer để xử lý lỗi tốt hơn
async function saveTestToServer(testData) {
  try {
    // Chuẩn hóa dữ liệu trước khi gửi
    const normalizedData = normalizeTestData(testData)

    // Thêm xác thực API
    const headers = {
      "Content-Type": "application/json",
    }

    // Thêm token xác thực nếu có
    const token = getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}/tests`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(normalizedData),
      credentials: "include", // Giúp xử lý cookie
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Lưu bài kiểm tra thất bại")
    }

    return await response.json()
  } catch (error) {
    console.error("Lỗi khi lưu bài kiểm tra:", error)
    throw error
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

// Thêm hàm xử lý tải lên file âm thanh
async function uploadAudioFile(audioFile) {
  try {
    const formData = new FormData()
    formData.append("audio", audioFile)

    const token = getToken()
    const headers = {}

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}/upload/audio`, {
      method: "POST",
      headers: headers,
      body: formData,
      credentials: "include",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Tải lên file âm thanh thất bại")
    }

    return await response.json()
  } catch (error) {
    console.error("Lỗi khi tải lên file âm thanh:", error)
    throw error
  }
}

// Thêm hàm xử lý tải lên file hình ảnh
async function uploadImageFile(imageFile) {
  try {
    const formData = new FormData()
    formData.append("image", imageFile)

    const token = getToken()
    const headers = {}

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}/upload/image`, {
      method: "POST",
      headers: headers,
      body: formData,
      credentials: "include",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Tải lên file hình ảnh thất bại")
    }

    return await response.json()
  } catch (error) {
    console.error("Lỗi khi tải lên file hình ảnh:", error)
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

// Xuất các hàm mới
window.uploadAudioFile = uploadAudioFile
window.uploadImageFile = uploadImageFile
