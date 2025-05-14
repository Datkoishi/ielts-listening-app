// Hàm kiểm tra kết nối server và hiển thị trạng thái
async function checkServerHealth() {
    try {
      const statusElement = document.getElementById("server-status")
      if (!statusElement) {
        console.warn("Không tìm thấy phần tử hiển thị trạng thái server")
        return
      }
  
      statusElement.textContent = "Đang kiểm tra..."
      statusElement.className = "status-checking"
  
      // Sử dụng endpoint /api/health thay vì /api/tests/health
      const response = await fetch("http://localhost:3000/api/health", {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        timeout: 5000,
      })
  
      if (response.ok) {
        const data = await response.json()
        console.log("Server health check successful:", data)
  
        statusElement.textContent = "Kết nối thành công"
        statusElement.className = "status-online"
        return true
      } else {
        console.error("Server health check failed:", response.status, response.statusText)
  
        statusElement.textContent = "Lỗi kết nối: " + response.status
        statusElement.className = "status-error"
        return false
      }
    } catch (error) {
      console.error("Error checking server health:", error)
  
      const statusElement = document.getElementById("server-status")
      if (statusElement) {
        statusElement.textContent = "Không thể kết nối đến server"
        statusElement.className = "status-offline"
      }
  
      return false
    }
  }
  
  // Thêm phần tử hiển thị trạng thái server vào DOM
  function addServerStatusElement() {
    const statusContainer = document.createElement("div")
    statusContainer.id = "server-status-container"
    statusContainer.style.position = "fixed"
    statusContainer.style.bottom = "10px"
    statusContainer.style.right = "10px"
    statusContainer.style.zIndex = "9999"
    statusContainer.style.backgroundColor = "#f0f0f0"
    statusContainer.style.padding = "5px 10px"
    statusContainer.style.borderRadius = "5px"
    statusContainer.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)"
    statusContainer.style.fontSize = "12px"
    statusContainer.style.display = "flex"
    statusContainer.style.alignItems = "center"
    statusContainer.style.gap = "5px"
  
    const statusLabel = document.createElement("span")
    statusLabel.textContent = "Server:"
    statusLabel.style.fontWeight = "bold"
  
    const statusElement = document.createElement("span")
    statusElement.id = "server-status"
    statusElement.textContent = "Đang kiểm tra..."
    statusElement.className = "status-checking"
  
    const checkButton = document.createElement("button")
    checkButton.textContent = "Kiểm tra"
    checkButton.style.marginLeft = "5px"
    checkButton.style.padding = "2px 5px"
    checkButton.style.fontSize = "12px"
    checkButton.style.cursor = "pointer"
    checkButton.onclick = checkServerHealth
  
    statusContainer.appendChild(statusLabel)
    statusContainer.appendChild(statusElement)
    statusContainer.appendChild(checkButton)
  
    // Thêm CSS cho các trạng thái
    const style = document.createElement("style")
    style.textContent = `
      .status-online { color: green; }
      .status-offline { color: red; }
      .status-error { color: orange; }
      .status-checking { color: blue; }
    `
    document.head.appendChild(style)
  
    document.body.appendChild(statusContainer)
  }
  
  // Khởi tạo khi trang đã tải xong
  document.addEventListener("DOMContentLoaded", () => {
    addServerStatusElement()
    checkServerHealth()
  
    // Kiểm tra định kỳ mỗi 30 giây
    setInterval(checkServerHealth, 30000)
  })
  
  // Thêm vào window object để có thể gọi từ console
  window.checkServerHealth = checkServerHealth
  