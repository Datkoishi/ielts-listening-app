// Hàm kiểm tra server và hiển thị trạng thái
async function checkServerStatus() {
    const statusElement = document.getElementById("server-status")
    if (!statusElement) return
  
    try {
      statusElement.textContent = "Đang kiểm tra kết nối server..."
      statusElement.className = "status-checking"
  
      const isConnected = await window.checkServerConnection()
  
      if (isConnected) {
        statusElement.textContent = "Server đang hoạt động"
        statusElement.className = "status-online"
      } else {
        statusElement.textContent = "Không thể kết nối đến server"
        statusElement.className = "status-offline"
      }
    } catch (error) {
      console.error("Lỗi kiểm tra server:", error)
      statusElement.textContent = "Lỗi kiểm tra kết nối: " + error.message
      statusElement.className = "status-error"
    }
  }
  
  // Thêm phần tử hiển thị trạng thái server vào trang
  function addServerStatusIndicator() {
    const container = document.querySelector(".header") || document.body
  
    const statusElement = document.createElement("div")
    statusElement.id = "server-status"
    statusElement.className = "status-unknown"
    statusElement.textContent = "Trạng thái server: Chưa kiểm tra"
    statusElement.style.padding = "5px 10px"
    statusElement.style.marginRight = "15px"
    statusElement.style.borderRadius = "4px"
    statusElement.style.fontSize = "14px"
  
    container.appendChild(statusElement)
  
    // Thêm styles
    const style = document.createElement("style")
    style.textContent = `
      .status-online { background-color: #4CAF50; color: white; }
      .status-offline { background-color: #F44336; color: white; }
      .status-checking { background-color: #2196F3; color: white; }
      .status-error { background-color: #FF9800; color: white; }
      .status-unknown { background-color: #9E9E9E; color: white; }
    `
    document.head.appendChild(style)
  
    // Kiểm tra ngay khi trang tải xong
    checkServerStatus()
  
    // Kiểm tra định kỳ mỗi 30 giây
    setInterval(checkServerStatus, 30000)
  }
  
  // Khởi tạo khi trang đã tải xong
  document.addEventListener("DOMContentLoaded", addServerStatusIndicator)
  
  // Thêm nút kiểm tra server thủ công
  function addCheckServerButton() {
    const container = document.querySelector(".test-actions") || document.body
  
    const button = document.createElement("button")
    button.textContent = "Kiểm tra server"
    button.onclick = checkServerStatus
    button.style.marginLeft = "10px"
  
    container.appendChild(button)
  }
  
  // Khởi tạo nút kiểm tra
  document.addEventListener("DOMContentLoaded", addCheckServerButton)
  