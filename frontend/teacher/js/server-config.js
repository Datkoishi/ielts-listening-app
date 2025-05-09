/**
 * Công cụ kiểm tra và sửa lỗi cấu hình server
 */

// Cấu hình mặc định
const DEFAULT_CONFIG = {
    apiUrl: "http://localhost:3000/api",
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  }
  
  // Lưu cấu hình hiện tại
  let currentConfig = { ...DEFAULT_CONFIG }
  
  /**
   * Tải cấu hình từ localStorage hoặc sử dụng mặc định
   */
  function loadConfig() {
    try {
      const savedConfig = localStorage.getItem("server_config")
      if (savedConfig) {
        currentConfig = { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) }
      }
      return currentConfig
    } catch (error) {
      console.error("Lỗi khi tải cấu hình server:", error)
      return DEFAULT_CONFIG
    }
  }
  
  /**
   * Lưu cấu hình vào localStorage
   * @param {Object} config - Cấu hình cần lưu
   */
  function saveConfig(config) {
    try {
      currentConfig = { ...currentConfig, ...config }
      localStorage.setItem("server_config", JSON.stringify(currentConfig))
      return true
    } catch (error) {
      console.error("Lỗi khi lưu cấu hình server:", error)
      return false
    }
  }
  
  /**
   * Kiểm tra kết nối đến server với cấu hình hiện tại
   * @returns {Promise<Object>} Kết quả kiểm tra
   */
  async function testServerConnection() {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), currentConfig.timeout)
  
      const startTime = Date.now()
      const response = await fetch(`${currentConfig.apiUrl}/health`, {
        method: "GET",
        signal: controller.signal,
      })
      const endTime = Date.now()
  
      clearTimeout(timeoutId)
  
      return {
        success: response.ok,
        status: response.status,
        latency: endTime - startTime,
        message: response.ok ? "Kết nối thành công" : "Kết nối thất bại",
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra kết nối server:", error)
  
      if (error.name === "AbortError") {
        return {
          success: false,
          status: 0,
          latency: currentConfig.timeout,
          message: "Kết nối bị timeout",
        }
      }
  
      return {
        success: false,
        status: 0,
        latency: 0,
        message: error.message || "Lỗi kết nối không xác định",
      }
    }
  }
  
  /**
   * Hiển thị giao diện cấu hình server
   * @param {string} containerId - ID của phần tử HTML để hiển thị giao diện
   */
  function showServerConfigUI(containerId) {
    const container = document.getElementById(containerId)
    if (!container) return
  
    // Tải cấu hình hiện tại
    loadConfig()
  
    // Tạo giao diện
    container.innerHTML = `
      <div class="server-config-panel">
        <h3>Cấu hình Kết nối Server</h3>
        
        <div class="config-form">
          <div class="form-group">
            <label for="apiUrl">URL API:</label>
            <input type="text" id="apiUrl" value="${currentConfig.apiUrl}">
          </div>
          
          <div class="form-group">
            <label for="timeout">Thời gian chờ (ms):</label>
            <input type="number" id="timeout" value="${currentConfig.timeout}">
          </div>
          
          <div class="form-group">
            <label for="retryAttempts">Số lần thử lại:</label>
            <input type="number" id="retryAttempts" value="${currentConfig.retryAttempts}">
          </div>
          
          <div class="form-group">
            <label for="retryDelay">Độ trễ thử lại (ms):</label>
            <input type="number" id="retryDelay" value="${currentConfig.retryDelay}">
          </div>
        </div>
        
        <div class="config-actions">
          <button id="testConnection">Kiểm tra kết nối</button>
          <button id="saveConfig">Lưu cấu hình</button>
          <button id="resetConfig">Khôi phục mặc định</button>
        </div>
        
        <div id="connectionStatus" class="connection-status"></div>
      </div>
    `
  
    // Thêm CSS
    const style = document.createElement("style")
    style.textContent = `
      .server-config-panel {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        margin: 10px 0;
        background-color: #f9f9f9;
      }
      .config-form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 15px;
      }
      .form-group {
        margin-bottom: 10px;
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
      .config-actions {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
      }
      .config-actions button {
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background-color: #003366;
        color: white;
      }
      .config-actions button:hover {
        background-color: #004080;
      }
      #resetConfig {
        background-color: #6c757d;
      }
      .connection-status {
        padding: 10px;
        border-radius: 4px;
        margin-top: 10px;
      }
      .status-success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      .status-error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
      .status-warning {
        background-color: #fff3cd;
        color: #856404;
        border: 1px solid #ffeeba;
      }
    `
    document.head.appendChild(style)
  
    // Xử lý sự kiện
    document.getElementById("testConnection").addEventListener("click", async () => {
      const statusElement = document.getElementById("connectionStatus")
      statusElement.innerHTML = "Đang kiểm tra kết nối..."
      statusElement.className = "connection-status"
  
      // Lấy giá trị từ form
      const formConfig = {
        apiUrl: document.getElementById("apiUrl").value,
        timeout: Number.parseInt(document.getElementById("timeout").value),
        retryAttempts: Number.parseInt(document.getElementById("retryAttempts").value),
        retryDelay: Number.parseInt(document.getElementById("retryDelay").value),
      }
  
      // Cập nhật cấu hình tạm thời
      currentConfig = { ...currentConfig, ...formConfig }
  
      // Kiểm tra kết nối
      const result = await testServerConnection()
  
      if (result.success) {
        statusElement.innerHTML = `
          <strong>Kết nối thành công!</strong><br>
          Độ trễ: ${result.latency}ms<br>
          Trạng thái: ${result.status}
        `
        statusElement.className = "connection-status status-success"
      } else {
        statusElement.innerHTML = `
          <strong>Kết nối thất bại!</strong><br>
          Lỗi: ${result.message}<br>
          Độ trễ: ${result.latency}ms
        `
        statusElement.className = "connection-status status-error"
      }
    })
  
    document.getElementById("saveConfig").addEventListener("click", () => {
      // Lấy giá trị từ form
      const formConfig = {
        apiUrl: document.getElementById("apiUrl").value,
        timeout: Number.parseInt(document.getElementById("timeout").value),
        retryAttempts: Number.parseInt(document.getElementById("retryAttempts").value),
        retryDelay: Number.parseInt(document.getElementById("retryDelay").value),
      }
  
      // Lưu cấu hình
      if (saveConfig(formConfig)) {
        const statusElement = document.getElementById("connectionStatus")
        statusElement.innerHTML = "Đã lưu cấu hình thành công!"
        statusElement.className = "connection-status status-success"
  
        // Cập nhật biến toàn cục API_URL
        if (window.API_URL !== formConfig.apiUrl) {
          window.API_URL = formConfig.apiUrl
          console.log(`Đã cập nhật API_URL thành ${window.API_URL}`)
        }
      }
    })
  
    document.getElementById("resetConfig").addEventListener("click", () => {
      // Khôi phục cấu hình mặc định
      saveConfig(DEFAULT_CONFIG)
  
      // Cập nhật giao diện
      document.getElementById("apiUrl").value = DEFAULT_CONFIG.apiUrl
      document.getElementById("timeout").value = DEFAULT_CONFIG.timeout
      document.getElementById("retryAttempts").value = DEFAULT_CONFIG.retryAttempts
      document.getElementById("retryDelay").value = DEFAULT_CONFIG.retryDelay
  
      const statusElement = document.getElementById("connectionStatus")
      statusElement.innerHTML = "Đã khôi phục cấu hình mặc định!"
      statusElement.className = "connection-status status-warning"
  
      // Cập nhật biến toàn cục API_URL
      if (window.API_URL !== DEFAULT_CONFIG.apiUrl) {
        window.API_URL = DEFAULT_CONFIG.apiUrl
        console.log(`Đã cập nhật API_URL thành ${window.API_URL}`)
      }
    })
  }
  
  // Xuất các hàm để sử dụng trong các file khác
  window.loadServerConfig = loadConfig
  window.saveServerConfig = saveConfig
  window.testServerConnection = testServerConnection
  window.showServerConfigUI = showServerConfigUI
  