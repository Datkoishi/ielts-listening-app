// Tích hợp frontend học sinh với backend API
const API_URL = "/api"

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
  return !!getToken()
}

// Lấy thông tin người dùng hiện tại
async function getCurrentUser() {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })

    if (!response.ok) {
      throw new Error("Không thể lấy thông tin người dùng")
    }

    return await response.json()
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error)
    return null
  }
}

// Đăng nhập
async function login(username, password) {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
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

    saveToken(data.token)
    return true
  } catch (error) {
    console.error("Lỗi đăng nhập:", error)
    throw error
  }
}

// Đăng ký
async function register(username, password, role = "student") {
  try {
    const response = await fetch(`${API_URL}/users/register`, {
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

    saveToken(data.token)
    return true
  } catch (error) {
    console.error("Lỗi đăng ký:", error)
    throw error
  }
}

// Lấy danh sách bài kiểm tra
async function getTests() {
  try {
    const response = await fetch(`${API_URL}/tests`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })

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
    const response = await fetch(`${API_URL}/tests/${testId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })

    if (!response.ok) {
      throw new Error("Không thể lấy thông tin bài kiểm tra")
    }

    return await response.json()
  } catch (error) {
    console.error("Lỗi khi lấy thông tin bài kiểm tra:", error)
    return null
  }
}

// Gửi câu trả lời của học sinh
async function submitAnswers(testId, answers) {
  try {
    const response = await fetch(`${API_URL}/tests/${testId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ answers }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Gửi câu trả lời thất bại")
    }

    return data
  } catch (error) {
    console.error("Lỗi khi gửi câu trả lời:", error)
    throw error
  }
}
