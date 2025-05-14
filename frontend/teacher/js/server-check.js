// Tạo UI hiển thị trạng thái kết nối server
function createServerStatusUI() {
  // Kiểm tra nếu đã tồn tại
  if (document.getElementById("server-status-container")) {
    return
  }

  // Tạo container
  const container = document.createElement("div")
  container.id = "server-status-container"
  container.style.position = "fixed"
  container.style.bottom = "10px"
  container.style.right = "10px"
  container.style.backgroundColor = "#f8f9fa"
  container.style.border = "1px solid #dee2e6"
  container.style.borderRadius = "4px"
  container.style.padding = "8px"
  container.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)"
  container.style.zIndex = "1000"
  container.style.fontSize = "14px"

  // Tạo nội dung
  container.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 5px;">
      <span style="margin-right: 8px;">Trạng thái server:</span>
      <span id="server-status-indicator" style="width: 12px; height: 12px; border-radius: 50%; background-color: #6c757d;"></span>
      <span id="server-status-text" style="margin-left: 5px;">Đang kiểm tra...</span>
    </div>
    <div style="display: flex; align-items: center; margin-bottom: 5px;">
      <span style="margin-right: 8px;">Trạng thái DB:</span>
      <span id="db-status-indicator" style="width: 12px; height: 12px; border-radius: 50%; background-color: #6c757d;"></span>
      <span id="db-status-text" style="margin-left: 5px;">Đang kiểm tra...</span>
    </div>
    <button id="check-server-btn" style="background-color: #007bff; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Kiểm tra lại</button>
  `

  document.body.appendChild(container)

  // Thêm sự kiện cho nút kiểm tra
  document.getElementById("check-server-btn").addEventListener("click", checkServerStatus)
}

// Cập nhật trạng thái server
function updateServerStatus(isConnected) {
  const indicator = document.getElementById("server-status-indicator")
  const text = document.getElementById("server-status-text")

  if (isConnected) {
    indicator.style.backgroundColor = "#28a745" // Xanh lá
    text.textContent = "Đã kết nối"
  } else {
    indicator.style.backgroundColor = "#dc3545" // Đỏ
    text.textContent = "Không kết nối"
  }
}

// Cập nhật trạng thái cơ sở dữ liệu
function updateDBStatus(isConnected) {
  const indicator = document.getElementById("db-status-indicator")
  const text = document.getElementById("db-status-text")

  if (isConnected) {
    indicator.style.backgroundColor = "#28a745" // Xanh lá
    text.textContent = "Đã kết nối"
  } else {
    indicator.style.backgroundColor = "#dc3545" // Đỏ
    text.textContent = "Không kết nối"
  }
}

// Kiểm tra trạng thái server
async function checkServerStatus() {
  // Cập nhật UI trạng thái đang kiểm tra
  const serverIndicator = document.getElementById("server-status-indicator")
  const serverText = document.getElementById("server-status-text")
  const dbIndicator = document.getElementById("db-status-indicator")
  const dbText = document.getElementById("db-status-text")

  serverIndicator.style.backgroundColor = "#6c757d" // Xám
  serverText.textContent = "Đang kiểm tra..."
  dbIndicator.style.backgroundColor = "#6c757d" // Xám
  dbText.textContent = "Đang kiểm tra..."

  // Kiểm tra kết nối server
  const isServerConnected = await window.checkServerConnection()
  updateServerStatus(isServerConnected)

  // Nếu server kết nối được, kiểm tra cơ sở dữ liệu
  if (isServerConnected) {
    const isDBConnected = await window.checkDatabaseConnection()
    updateDBStatus(isDBConnected)
  } else {
    updateDBStatus(false)
  }
}

// Khởi tạo khi trang đã tải xong
document.addEventListener("DOMContentLoaded", () => {
  createServerStatusUI()
  checkServerStatus()

  // Kiểm tra định kỳ mỗi 30 giây
  setInterval(checkServerStatus, 30000)
})
