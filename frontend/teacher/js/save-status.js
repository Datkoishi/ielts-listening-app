// Cập nhật hàm kiểm tra và hiển thị trạng thái lưu
function checkAndDisplaySaveStatus() {
  try {
    // Lấy tiêu đề từ input
    const testTitle = document.getElementById("testTitle")?.value

    if (!testTitle) {
      alert("Vui lòng nhập tiêu đề bài kiểm tra trước khi kiểm tra trạng thái lưu")
      return
    }

    // Hiển thị thông báo đang kiểm tra
    console.log("Đang kiểm tra trạng thái lưu cho:", testTitle)

    // Gọi hàm kiểm tra từ client-integration.js
    window
      .checkTestSaveStatus(testTitle)
      .then((status) => {
        console.log("Kết quả kiểm tra:", status)

        if (status.saved) {
          alert(
            `Bài kiểm tra "${testTitle}" đã được lưu tại: ${status.location === "database" ? "máy chủ" : "cục bộ"}\nThời gian: ${status.timestamp}`,
          )

          // Hiển thị biểu tượng đã lưu bên cạnh tiêu đề
          updateSaveStatusIcon(true)
        } else {
          alert(`Bài kiểm tra "${testTitle}" chưa được lưu: ${status.reason}`)

          // Hiển thị biểu tượng chưa lưu
          updateSaveStatusIcon(false)
        }
      })
      .catch((error) => {
        console.error("Lỗi khi kiểm tra trạng thái lưu:", error)
        alert(`Lỗi khi kiểm tra: ${error.message}`)
        updateSaveStatusIcon(false)
      })
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái lưu:", error)
    alert(`Lỗi: ${error.message}`)
  }
}

// Cập nhật biểu tượng trạng thái lưu
function updateSaveStatusIcon(isSaved) {
  // Tìm hoặc tạo phần tử hiển thị trạng thái
  let statusIcon = document.getElementById("saveStatusIcon")

  if (!statusIcon) {
    // Tạo phần tử mới nếu chưa tồn tại
    statusIcon = document.createElement("span")
    statusIcon.id = "saveStatusIcon"
    statusIcon.style.marginLeft = "10px"

    // Thêm vào sau input tiêu đề
    const titleInput = document.getElementById("testTitle")
    if (titleInput && titleInput.parentNode) {
      titleInput.parentNode.appendChild(statusIcon)
    }
  }

  // Cập nhật biểu tượng và màu sắc
  if (isSaved) {
    statusIcon.innerHTML = '<i class="fas fa-check-circle" style="color: green;"></i>'
    statusIcon.title = "Bài kiểm tra đã được lưu"
  } else {
    statusIcon.innerHTML = '<i class="fas fa-exclamation-circle" style="color: orange;"></i>'
    statusIcon.title = "Bài kiểm tra chưa được lưu hoặc có thay đổi chưa lưu"
  }
}

// Thêm nút kiểm tra trạng thái lưu vào giao diện
function addCheckSaveStatusButton() {
  // Tìm container chứa các nút
  const testActions = document.querySelector(".save-button-container")

  if (testActions) {
    // Tạo nút mới
    const checkButton = document.createElement("button")
    checkButton.className = "check-status-btn"
    checkButton.innerHTML = '<i class="fas fa-question-circle"></i> Kiểm tra trạng thái lưu'
    checkButton.onclick = checkAndDisplaySaveStatus

    // Thêm style cho nút
    checkButton.style.marginLeft = "10px"
    checkButton.style.backgroundColor = "#4a6fa5"
    checkButton.style.color = "white"
    checkButton.style.border = "none"
    checkButton.style.padding = "8px 15px"
    checkButton.style.borderRadius = "4px"
    checkButton.style.cursor = "pointer"

    // Thêm vào container
    testActions.appendChild(checkButton)
  }
}

// Add this function to create a debug button

// Thêm nút debug để kiểm tra lỗi
function addDebugButton() {
  // Tìm container chứa các nút
  const testActions = document.querySelector(".save-button-container")

  if (testActions) {
    // Tạo nút mới
    const debugButton = document.createElement("button")
    debugButton.className = "debug-btn"
    debugButton.innerHTML = '<i class="fas fa-bug"></i> Debug'
    debugButton.onclick = debugTestSaving

    // Thêm style cho nút
    debugButton.style.marginLeft = "10px"
    debugButton.style.backgroundColor = "#ff9800"
    debugButton.style.color = "white"
    debugButton.style.border = "none"
    debugButton.style.padding = "8px 15px"
    debugButton.style.borderRadius = "4px"
    debugButton.style.cursor = "pointer"

    // Thêm vào container
    testActions.appendChild(debugButton)
  }
}

// Hàm debug để kiểm tra lỗi lưu bài kiểm tra
async function debugTestSaving() {
  try {
    const testTitle = document.getElementById("testTitle")?.value

    if (!testTitle) {
      alert("Vui lòng nhập tiêu đề bài kiểm tra trước khi debug")
      return
    }

    // Hiển thị thông báo đang kiểm tra
    alert(`Đang debug bài kiểm tra: "${testTitle}"\nKết quả sẽ hiển thị trong console.`)

    // Kiểm tra kết nối server
    const serverConnected = await window.checkServerConnection()
    console.log("Server connection:", serverConnected)

    // Kiểm tra kết nối database
    const dbConnected = await window.checkDatabaseConnection()
    console.log("Database connection:", dbConnected)

    // Kiểm tra bài kiểm tra theo tiêu đề
    const checkResult = await window.checkTestByTitle(testTitle)
    console.log("Check test by title result:", checkResult)

    // Lấy danh sách bài kiểm tra
    const tests = await window.getTests()
    console.log("All tests:", tests)

    // Kiểm tra localStorage
    const offlineTests = JSON.parse(localStorage.getItem("offlineTests") || "[]")
    console.log("Offline tests:", offlineTests)

    // Hiển thị kết quả
    let resultMessage = `Debug Results for "${testTitle}":\n\n`
    resultMessage += `Server Connection: ${serverConnected ? "OK" : "Failed"}\n`
    resultMessage += `Database Connection: ${dbConnected ? "OK" : "Failed"}\n`
    resultMessage += `Test Found: ${checkResult.exists ? "Yes" : "No"}\n`
    resultMessage += `Total Tests on Server: ${tests.length}\n`
    resultMessage += `Offline Tests: ${offlineTests.length}\n\n`
    resultMessage += "See console for more details."

    alert(resultMessage)
  } catch (error) {
    console.error("Error in debug function:", error)
    alert(`Debug error: ${error.message}`)
  }
}

// Khởi tạo khi trang đã tải xong
document.addEventListener("DOMContentLoaded", () => {
  addCheckSaveStatusButton()
  addDebugButton() // Add the debug button

  // Kiểm tra trạng thái lưu ban đầu sau 2 giây
  setTimeout(() => {
    const testTitle = document.getElementById("testTitle")?.value
    if (testTitle) {
      window
        .checkTestSaveStatus(testTitle)
        .then((status) => {
          updateSaveStatusIcon(status.saved)
        })
        .catch(() => {
          updateSaveStatusIcon(false)
        })
    }
  }, 2000)
})

// Thêm vào window object để có thể gọi từ HTML
window.checkAndDisplaySaveStatus = checkAndDisplaySaveStatus

// Giả sử showNotification được định nghĩa ở một nơi khác, ví dụ:
// function showNotification(message, type) {
//   console.log(`Notification (${type}): ${message}`);
//   // Triển khai thực tế sẽ hiển thị thông báo trên giao diện người dùng
// }
