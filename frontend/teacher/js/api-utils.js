/**
 * Các tiện ích API - Kiểm tra kết nối và xác thực
 */

// Cấu hình API
const API_URL = "http://localhost:3000/api"
const CONNECTION_TIMEOUT = 5000 // 5 giây timeout

/**
 * Kiểm tra kết nối đến server API
 * @returns {Promise<boolean>} Kết quả kiểm tra kết nối
 */
async function checkApiConnection() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT)

    const response = await fetch(`${API_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.error("Lỗi khi kiểm tra kết nối API:", error)
    return false
  }
}

/**
 * Kiểm tra tính hợp lệ của token xác thực
 * @returns {Promise<boolean>} Kết quả kiểm tra token
 */
async function validateAuthToken() {
  try {
    const token = localStorage.getItem("token")
    if (!token) return false

    const response = await fetch(`${API_URL}/auth/validate`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error("Lỗi khi xác thực token:", error)
    return false
  }
}

/**
 * Kiểm tra và hiển thị trạng thái kết nối API
 * @param {string} containerId - ID của phần tử HTML để hiển thị trạng thái
 */
async function displayApiStatus(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  container.innerHTML = '<div class="api-status-checking">Đang kiểm tra kết nối API...</div>'

  const isConnected = await checkApiConnection()
  const isAuthenticated = await validateAuthToken()

  if (isConnected) {
    if (isAuthenticated) {
      container.innerHTML = '<div class="api-status-ok">✅ Đã kết nối đến API và xác thực thành công</div>'
    } else {
      container.innerHTML = '<div class="api-status-warning">⚠️ Đã kết nối đến API nhưng chưa xác thực</div>'
    }
  } else {
    container.innerHTML = '<div class="api-status-error">❌ Không thể kết nối đến API</div>'
  }
}

/**
 * Xử lý lỗi API và hiển thị thông báo phù hợp
 * @param {Error} error - Lỗi cần xử lý
 * @returns {string} Thông báo lỗi người dùng
 */
function handleApiError(error) {
  // Lỗi kết nối mạng
  if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn."
  }

  // Lỗi timeout
  if (error.name === "AbortError") {
    return "Yêu cầu đã hết thời gian chờ. Máy chủ có thể đang bận hoặc không phản hồi."
  }

  // Lỗi xác thực
  if (
    error.message.includes("401") ||
    error.message.includes("unauthorized") ||
    error.message.includes("Unauthorized")
  ) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
  }

  // Lỗi quyền truy cập
  if (error.message.includes("403") || error.message.includes("forbidden") || error.message.includes("Forbidden")) {
    return "Bạn không có quyền thực hiện thao tác này."
  }

  // Lỗi không tìm thấy
  if (error.message.includes("404") || error.message.includes("not found") || error.message.includes("Not Found")) {
    return "Không tìm thấy tài nguyên yêu cầu."
  }

  // Lỗi máy chủ
  if (
    error.message.includes("500") ||
    error.message.includes("server error") ||
    error.message.includes("Server Error")
  ) {
    return "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau."
  }

  // Lỗi khác
  return error.message || "Đã xảy ra lỗi không xác định."
}

// Xuất các hàm để sử dụng trong các file khác
window.checkApiConnection = checkApiConnection
window.validateAuthToken = validateAuthToken
window.displayApiStatus = displayApiStatus
window.handleApiError = handleApiError
