/**
 * Công cụ kiểm tra trạng thái server
 */

// Cấu hình mặc định
const SERVER_CHECK_INTERVAL = 30000 // 30 giây
let serverCheckTimer = null
let lastServerStatus = false

/**
 * Kiểm tra xem server có đang chạy không
 * @returns {Promise<boolean>} Kết quả kiểm tra
 */
async function isServerRunning() {
  try {
    // Lấy cấu hình API URL từ localStorage hoặc sử dụng mặc định
    const config = JSON.parse(localStorage.getItem("server_config")) || {}
    const apiUrl = config.apiUrl || "http://localhost:3000/api"

    // Thử kết nối đến các endpoint khác nhau
    const endpoints = [`${apiUrl}/health`, apiUrl, apiUrl.replace("/api", "")]

    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const response = await fetch(endpoint, {
          method: "GET",
          signal: controller.signal,
          // Thêm cache: 'no-store' để tránh cache
          cache: "no-store",
          // Thêm timestamp để tránh cache
          headers: {
            Pragma: "no-cache",
            "Cache-Control": "no-cache",
            "X-Timestamp": Date.now(),
          },
        })

        clearTimeout(timeoutId)

        // Nếu server trả về bất kỳ response nào (kể cả 404), coi là server đang chạy
        return true
      } catch (endpointError) {
        // Nếu lỗi không phải là AbortError (timeout), thử endpoint tiếp theo
        if (endpointError.name !== "AbortError") {
          continue
        }
      }
    }

    // Nếu tất cả các endpoint đều không phản hồi
    return false
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái server:", error)
    return false
  }
}

/**
 * Hiển thị trạng thái server
 * @param {string} containerId - ID của phần tử HTML để hiển thị trạng thái
 */
async function displayServerStatus(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  const serverRunning = await isServerRunning()
  lastServerStatus = serverRunning

  if (serverRunning) {
    container.innerHTML = '<div class="server-status-ok">✅ Server đang hoạt động</div>'
    container.classList.remove("server-offline")
    container.classList.add("server-online")
  } else {
    container.innerHTML = '<div class="server-status-error">❌ Server không hoạt động</div>'
    container.classList.remove("server-online")
    container.classList.add("server-offline")

    // Hiển thị hướng dẫn khởi động server
    container.innerHTML += `
      <div class="server-start-guide">
        <p>Hướng dẫn khởi động server:</p>
        <ol>
          <li>Mở terminal hoặc command prompt</li>
          <li>Di chuyển đến thư mục backend: <code>cd đường_dẫn_đến_thư_mục/backend</code></li>
          <li>Chạy lệnh: <code>npm start</code> hoặc <code>node server.js</code></li>
        </ol>
      </div>
    `
  }
}

/**
 * Bắt đầu kiểm tra server định kỳ
 * @param {string} containerId - ID của phần tử HTML để hiển thị trạng thái
 */
function startServerStatusCheck(containerId) {
  // Kiểm tra ngay lập tức
  displayServerStatus(containerId)

  // Thiết lập kiểm tra định kỳ
  if (serverCheckTimer) {
    clearInterval(serverCheckTimer)
  }

  serverCheckTimer = setInterval(() => {
    displayServerStatus(containerId)
  }, SERVER_CHECK_INTERVAL)
}

/**
 * Dừng kiểm tra server định kỳ
 */
function stopServerStatusCheck() {
  if (serverCheckTimer) {
    clearInterval(serverCheckTimer)
    serverCheckTimer = null
  }
}

// Thêm CSS cho trạng thái server
function addServerStatusStyles() {
  const style = document.createElement("style")
  style.textContent = `
    .server-status-container {
      position: fixed;
      bottom: 10px;
      right: 10px;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 1000;
      transition: all 0.3s ease;
    }
    
    .server-online {
      background-color: rgba(220, 252, 231, 0.9);
      border: 1px solid #16a34a;
    }
    
    .server-offline {
      background-color: rgba(254, 226, 226, 0.9);
      border: 1px solid #dc2626;
    }
    
    .server-status-ok {
      color: #16a34a;
      font-weight: bold;
    }
    
    .server-status-error {
      color: #dc2626;
      font-weight: bold;
    }
    
    .server-start-guide {
      margin-top: 10px;
      font-size: 12px;
      color: #4b5563;
    }
    
    .server-start-guide code {
      background-color: #f3f4f6;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: monospace;
    }
  `
  document.head.appendChild(style)
}

// Xuất các hàm để sử dụng trong các file khác
window.isServerRunning = isServerRunning
window.displayServerStatus = displayServerStatus
window.startServerStatusCheck = startServerStatusCheck
window.stopServerStatusCheck = stopServerStatusCheck

// Thêm styles khi script được tải
addServerStatusStyles()
