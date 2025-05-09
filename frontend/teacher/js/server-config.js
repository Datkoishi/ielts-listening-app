/**
 * Công cụ cấu hình server API
 */

// Khai báo biến API_URL
window.API_URL = window.API_URL || localStorage.getItem("API_URL") || "http://localhost:3000/api"

/**
 * Hiển thị giao diện cấu hình server
 * @param {string} containerId - ID của phần tử HTML để hiển thị giao diện
 */
function showServerConfigUI(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  // Hiển thị giao diện
  container.innerHTML = `
    <div class="server-config">
      <h3>Cấu hình kết nối server API</h3>
      <div class="form-group">
        <label for="apiUrl">URL API:</label>
        <input type="text" id="apiUrl" value="${window.API_URL}" placeholder="http://localhost:3000/api">
      </div>
      <div class="form-group">
        <label for="apiToken">Token xác thực (nếu có):</label>
        <input type="password" id="apiToken" value="${localStorage.getItem("token") || ""}" placeholder="Bearer token">
      </div>
      <div class="server-config-actions">
        <button id="saveConfigBtn">Lưu cấu hình</button>
        <button id="testConnectionBtn">Kiểm tra kết nối</button>
        <button id="closeConfigBtn">Đóng</button>
      </div>
      <div id="connectionStatus" class="connection-status"></div>
    </div>
  `

  // Thêm CSS
  const style = document.createElement("style")
  style.textContent = `
    .server-config {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      margin: 10px 0;
      background-color: #f9f9f9;
    }
    .server-config h3 {
      margin-top: 0;
      margin-bottom: 15px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    .form-group input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .server-config-actions {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }
    .server-config-actions button {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background-color: #003366;
      color: white;
    }
    .server-config-actions button:hover {
      background-color: #004080;
    }
    .connection-status {
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
      display: none;
    }
    .connection-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
      display: block;
    }
    .connection-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      display: block;
    }
  `
  document.head.appendChild(style)

  // Xử lý sự kiện nút
  document.getElementById("saveConfigBtn").addEventListener("click", () => {
    const apiUrl = document.getElementById("apiUrl").value
    const apiToken = document.getElementById("apiToken").value

    // Lưu cấu hình
    window.API_URL = apiUrl
    localStorage.setItem("API_URL", apiUrl)

    if (apiToken) {
      localStorage.setItem("token", apiToken)
    }

    // Hiển thị thông báo
    const connectionStatus = document.getElementById("connectionStatus")
    connectionStatus.textContent = "Đã lưu cấu hình thành công!"
    connectionStatus.className = "connection-status connection-success"

    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
      connectionStatus.style.display = "none"
    }, 3000)
  })

  document.getElementById("testConnectionBtn").addEventListener("click", async () => {
    const connectionStatus = document.getElementById("connectionStatus")
    connectionStatus.textContent = "Đang kiểm tra kết nối..."
    connectionStatus.className = "connection-status"
    connectionStatus.style.display = "block"
    connectionStatus.style.backgroundColor = "#e2e3e5"
    connectionStatus.style.color = "#383d41"
    connectionStatus.style.border = "1px solid #d6d8db"

    try {
      const apiUrl = document.getElementById("apiUrl").value
      const response = await fetch(`${apiUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        timeout: 5000,
      })

      if (response.ok) {
        connectionStatus.textContent = "✅ Kết nối thành công!"
        connectionStatus.className = "connection-status connection-success"
      } else {
        connectionStatus.textContent = `❌ Lỗi kết nối: ${response.status} ${response.statusText}`
        connectionStatus.className = "connection-status connection-error"
      }
    } catch (error) {
      connectionStatus.textContent = `❌ Lỗi kết nối: ${error.message}`
      connectionStatus.className = "connection-status connection-error"
    }
  })

  document.getElementById("closeConfigBtn").addEventListener("click", () => {
    container.innerHTML = ""
  })
}

// Xuất hàm để sử dụng trong các file khác
window.showServerConfigUI = showServerConfigUI

// Đảm bảo hàm được xuất đúng cách
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    showServerConfigUI,
  }
}

// Thông báo khi file được tải thành công
console.log("server-config.js đã được tải thành công")
