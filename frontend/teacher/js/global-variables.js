/**
 * Khởi tạo các biến toàn cục cho ứng dụng IELTS Listening Test Creator
 */

// Khởi tạo API_URL nếu chưa tồn tại
if (typeof window.API_URL === "undefined") {
    // Thử lấy từ localStorage trước
    const savedApiUrl = localStorage.getItem("API_URL")
    window.API_URL = savedApiUrl || "http://localhost:3000/api"
    console.log(`Đã khởi tạo API_URL: ${window.API_URL}`)
  }
  
  // Khởi tạo biến test nếu chưa tồn tại
  if (typeof window.test === "undefined") {
    window.test = {
      title: "",
      vietnameseName: "",
      description: "",
      difficulty: "medium",
      version: 1,
      createdBy: 1,
      status: "draft",
      part1: [],
      part2: [],
      part3: [],
      part4: [],
      part1Instructions: "Hướng dẫn cho phần 1",
      part2Instructions: "Hướng dẫn cho phần 2",
      part3Instructions: "Hướng dẫn cho phần 3",
      part4Instructions: "Hướng dẫn cho phần 4",
    }
    console.log("Đã khởi tạo biến test")
  }
  
  // Khởi tạo biến currentPart nếu chưa tồn tại
  if (typeof window.currentPart === "undefined") {
    window.currentPart = 1
    console.log("Đã khởi tạo currentPart = 1")
  }
  
  // Khởi tạo biến selectedTypes nếu chưa tồn tại
  if (typeof window.selectedTypes === "undefined") {
    window.selectedTypes = []
    console.log("Đã khởi tạo selectedTypes = []")
  }
  
  // Khởi tạo biến audioFile nếu chưa tồn tại
  if (typeof window.audioFile === "undefined") {
    window.audioFile = null
    console.log("Đã khởi tạo audioFile = null")
  }
  
  // Khởi tạo các biến khác nếu cần
  if (typeof window.isServerRunning === "undefined") {
    window.isServerRunning = () =>
      new Promise((resolve) => {
        fetch(`${window.API_URL}`, { method: "GET" })
          .then((response) => {
            resolve(response.ok || response.status === 404)
          })
          .catch(() => {
            resolve(false)
          })
      })
    console.log("Đã khởi tạo hàm isServerRunning")
  }
  
  // Xuất các biến để sử dụng trong các file khác
  console.log("Đã khởi tạo các biến toàn cục")
  