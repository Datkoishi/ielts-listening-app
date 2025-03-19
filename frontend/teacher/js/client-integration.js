// Tích hợp frontend với backend API
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
  return true // Luôn trả về true để bỏ qua kiểm tra đăng nhập
}

// Lấy thông tin người dùng hiện tại
async function getCurrentUser() {
  return { id: 1, username: "teacher", role: "teacher" } // Trả về người dùng mặc định
}

// Đăng nhập - không cần nữa
async function login(username, password) {
  return true // Luôn trả về thành công
}

// Đăng ký - không cần nữa
async function register(username, password, role = "teacher") {
  return true // Luôn trả về thành công
}

// Lưu bài kiểm tra lên server
async function saveTestToServer(testData) {
  try {
    const response = await fetch(`${API_URL}/tests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Lưu bài kiểm tra thất bại")
    }

    return data
  } catch (error) {
    console.error("Lỗi khi lưu bài kiểm tra:", error)
    throw error
  }
}

// Lấy danh sách bài kiểm tra
async function getTests() {
  try {
    const response = await fetch(`${API_URL}/tests`)

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
    const response = await fetch(`${API_URL}/tests/${testId}`)

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
    const response = await fetch(`${API_URL}/tests/${testId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Cập nhật bài kiểm tra thất bại")
    }

    return data
  } catch (error) {
    console.error("Lỗi khi cập nhật bài kiểm tra:", error)
    throw error
  }
}

// Xóa bài kiểm tra
async function deleteTest(testId) {
  try {
    const response = await fetch(`${API_URL}/tests/${testId}`, {
      method: "DELETE",
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Xóa bài kiểm tra thất bại")
    }

    return data
  } catch (error) {
    console.error("Lỗi khi xóa bài kiểm tra:", error)
    throw error
  }
}

