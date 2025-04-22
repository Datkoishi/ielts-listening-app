// Hàm lưu bài kiểm tra
async function saveTest() {
  try {
    // Hiển thị thông báo đang lưu
    showNotification("Đang lưu bài kiểm tra...", "info")

    // Lấy thông tin bài kiểm tra
    const title = document.getElementById("test-title").value.trim()
    const vietnameseName = document.getElementById("test-vietnamese-name").value.trim()
    const description = document.getElementById("test-description").value.trim()

    // Kiểm tra tiêu đề
    if (!title) {
      showNotification("Vui lòng nhập tiêu đề bài kiểm tra", "error")
      return
    }

    // Lấy dữ liệu câu hỏi từ các phần
    const part1 = getQuestionsFromPart(1)
    const part2 = getQuestionsFromPart(2)
    const part3 = getQuestionsFromPart(3)
    const part4 = getQuestionsFromPart(4)

    // Kiểm tra xem có ít nhất một câu hỏi
    const totalQuestions = part1.length + part2.length + part3.length + part4.length
    if (totalQuestions === 0) {
      showNotification("Vui lòng thêm ít nhất một câu hỏi", "error")
      return
    }

    // Tạo đối tượng dữ liệu để gửi
    const testData = {
      title,
      vietnameseName,
      description,
      part1,
      part2,
      part3,
      part4,
    }

    console.log("Dữ liệu bài kiểm tra sẽ gửi:", testData)

    // Gửi dữ liệu lên server
    const response = await fetch("/api/tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(testData),
    })

    const result = await response.json()

    if (!response.ok) {
      showNotification(`Lỗi: ${result.message || "Không thể lưu bài kiểm tra"}`, "error")
      console.error("Lỗi khi lưu bài kiểm tra:", result)
      return
    }

    // Hiển thị thông báo thành công
    showNotification("Lưu bài kiểm tra thành công!", "success")
    console.log("Kết quả lưu bài kiểm tra:", result)

    // Chuyển hướng đến trang quản lý bài kiểm tra sau khi lưu thành công
    setTimeout(() => {
      window.location.href = "/teacher/tests.html"
    }, 2000)
  } catch (error) {
    console.error("Lỗi khi lưu bài kiểm tra:", error)
    showNotification(`Lỗi: ${error.message || "Không thể lưu bài kiểm tra"}`, "error")
  }
}

// Hàm lấy danh sách câu hỏi từ một phần
function getQuestionsFromPart(partNumber) {
  const partContainer = document.getElementById(`part${partNumber}-questions`)
  const questionElements = partContainer.querySelectorAll(".question-item")
  const questions = []

  questionElements.forEach((questionElement) => {
    const questionData = JSON.parse(questionElement.dataset.questionData || "{}")
    if (Object.keys(questionData).length > 0) {
      questions.push(questionData)
    }
  })

  return questions
}

// Hàm hiển thị thông báo
function showNotification(message, type = "info") {
  const notification = document.getElementById("notification")
  notification.textContent = message
  notification.className = `alert alert-${type}`
  notification.style.display = "block"

  // Tự động ẩn thông báo sau 5 giây
  setTimeout(() => {
    notification.style.display = "none"
  }, 5000)
}
