// Hằng số
const MAX_QUESTIONS = 40
const PARTS = 4

// Biến toàn cục
const selectedTypes = []
let currentPart = 1
const totalQuestions = 0
let audioFile = null
let audioDuration = 0

// Thêm metadata cho đối tượng bài kiểm tra
// Make sure we're using the same test object across files
if (!window.test) {
  window.test = {
    title: "",
    vietnameseName: "",
    description: "",
    part1: [],
    part2: [],
    part3: [],
    part4: [],
  }
}
let test = window.test

// Khởi tạo sự kiện khi trang được tải
document.addEventListener("DOMContentLoaded", () => {
  // Thêm sự kiện cho các nút chính
  // Remove this entire event listener since it's now handled in index.js
  // document.getElementById("startTestBtn").addEventListener("click", startTestCreation)
  // document.getElementById("previousPartBtn").addEventListener("click", previousPart)
  // document.getElementById("nextPartBtn").addEventListener("click", nextPart)
  // document.getElementById("saveTestBtn").addEventListener("click", saveTest)

  // Tạo và thêm các nút bổ sung
  const testCreationPage = document.getElementById("testCreationPage")
  if (testCreationPage) {
    // Nút xem trước bài kiểm tra
    const previewTestBtn = document.createElement("button")
    previewTestBtn.id = "previewTestBtn"
    previewTestBtn.className = "action-button"
    previewTestBtn.innerHTML = '<i class="fas fa-eye"></i> Xem trước bài kiểm tra'
    previewTestBtn.addEventListener("click", previewEntireTest)
    testCreationPage.appendChild(previewTestBtn)

    // Nút xuất bài kiểm tra
    const exportTestBtn = document.createElement("button")
    exportTestBtn.id = "exportTestBtn"
    exportTestBtn.className = "action-button"
    exportTestBtn.innerHTML = '<i class="fas fa-file-export"></i> Xuất bài kiểm tra'
    exportTestBtn.addEventListener("click", exportTest)
    testCreationPage.appendChild(exportTestBtn)

    // Nút nhập bài kiểm tra
    const importTestBtn = document.createElement("button")
    importTestBtn.id = "importTestBtn"
    importTestBtn.className = "action-button"
    importTestBtn.innerHTML = '<i class="fas fa-file-import"></i> Nhập bài kiểm tra'
    importTestBtn.addEventListener("click", importTest)
    testCreationPage.appendChild(importTestBtn)

    // Nút lưu bộ câu hỏi
    const saveQuestionSetBtn = document.createElement("button")
    saveQuestionSetBtn.id = "saveQuestionSetBtn"
    saveQuestionSetBtn.className = "action-button"
    saveQuestionSetBtn.innerHTML = '<i class="fas fa-save"></i> Lưu bộ câu hỏi'
    saveQuestionSetBtn.addEventListener("click", saveQuestionSet)
    testCreationPage.appendChild(saveQuestionSetBtn)

    // Nút danh sách bài kiểm tra
    const loadTestListBtn = document.createElement("button")
    loadTestListBtn.id = "loadTestListBtn"
    loadTestListBtn.className = "action-button"
    loadTestListBtn.innerHTML = '<i class="fas fa-list"></i> Danh sách bài kiểm tra'
    loadTestListBtn.addEventListener("click", showTestList)
    testCreationPage.appendChild(loadTestListBtn)
  }

  // Lấy danh sách loại câu hỏi
  fetchQuestionTypes()

  // Thêm form metadata bài kiểm tra
  addTestMetadataForm()

  // Thiết lập xử lý âm thanh
  setupAudioHandlers()

  // Thêm nút debug
  setTimeout(addDebugButtons, 1000)
})

// Add initialization for the window object
document.addEventListener("DOMContentLoaded", () => {
  // Initialize global variables
  window.currentPart = 1

  // Expose functions to window object
  window.addAnswerInput = addAnswerInput || (() => {})
  window.removeAnswerInput = removeAnswerInput || (() => {})
  window.saveQuestion = saveQuestion || (() => {})
  window.previewQuestion = previewQuestion || (() => {})

  // Initialize event listeners
  const startButton = document.querySelector(".selection-page button")
  if (startButton) {
    startButton.addEventListener("click", startTestCreation)
  }

  console.log("main.js loaded successfully")
})

// Bắt đầu tạo bài kiểm tra - COMMENTING OUT THIS FUNCTION AS WE'LL USE THE ONE FROM test-management.js
/*
function startTestCreation() {
  console.log("Starting test creation...");
  selectedTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value)
  if (selectedTypes.length === 0) {
    alert("Vui lòng chọn ít nhất một loại câu hỏi.")
    return
  }
  document.getElementById("selectionPage").classList.add("hidden")
  document.getElementById("testCreationPage").classList.remove("hidden")
  renderTestCreation()
}
*/

// Make sure these functions are available globally
// window.startTestCreation = startTestCreation; // COMMENTING OUT
window.previousPart = previousPart
window.nextPart = nextPart
// window.saveTest = saveTest
// window.renderTestCreation = renderTestCreation; // COMMENTING OUT

// Hiển thị giao diện tạo bài kiểm tra - COMMENTING OUT THIS FUNCTION AS WE'LL USE THE ONE FROM test-management.js
/*
function renderTestCreation() {
  const testContent = document.getElementById("testContent")
  if (!testContent) {
    console.error("Không tìm thấy phần tử nội dung bài kiểm tra")
    return
  }

  testContent.innerHTML = `
    <div class="part-header">
      <h2><i class="fas fa-list-ol"></i> Phần ${currentPart}</h2>
      <div class="question-count"><i class="fas fa-question-circle"></i> Tổng số câu hỏi: ${totalQuestions}/${MAX_QUESTIONS}</div>
    </div>
  `

  // Thêm form metadata bài kiểm tra
  addTestMetadataForm()

  // Tạo tất cả các container phần nếu chưa tồn tại
  for (let i = 1; i <= 4; i++) {
    if (!document.getElementById(`part${i}`)) {
      const part = document.createElement("div")
      part.className = "part"
      part.id = `part${i}`
      part.style.display = i === currentPart ? "block" : "none"
      testContent.appendChild(part)
    }
  }

  const currentPartElement = document.getElementById(`part${currentPart}`)
  if (currentPartElement) {
    currentPartElement.style.display = "block"
    renderQuestionTypes(currentPartElement)
  }

  // Hiển thị các câu hỏi hiện có cho phần hiện tại
  displayExistingQuestions(currentPart)
}
*/

// Chuyển đến phần trước
function previousPart() {
  console.log("previousPart called from main.js, current part:", currentPart)
  if (typeof window.previousPart === "function") {
    window.previousPart()
  } else {
    console.log("Using local previousPart implementation")
    if (currentPart > 1) {
      // Ẩn phần hiện tại
      const currentPartElement = document.getElementById(`part${currentPart}`)
      if (currentPartElement) {
        currentPartElement.style.display = "none"
      }

      // Hiển thị phần trước
      currentPart--
      const previousPartElement = document.getElementById(`part${currentPart}`)
      if (previousPartElement) {
        previousPartElement.style.display = "block"
      }

      // Cập nhật tiêu đề phần
      const partHeader = document.querySelector(".part-header h2")
      if (partHeader) {
        partHeader.innerHTML = `<i class="fas fa-list-ol"></i> Phần ${currentPart}`
      }
    }
  }
}

// Chuyển đến phần tiếp theo
function nextPart() {
  console.log("nextPart called from main.js, current part:", currentPart)
  if (typeof window.nextPart === "function") {
    window.nextPart()
  } else {
    console.log("Using local nextPart implementation")
    if (currentPart < 4) {
      // Ẩn phần hiện tại
      const currentPartElement = document.getElementById(`part${currentPart}`)
      if (currentPartElement) {
        currentPartElement.style.display = "none"
      }

      // Hiển thị phần tiếp theo
      currentPart++
      const nextPartElement = document.getElementById(`part${currentPart}`)
      if (nextPartElement) {
        nextPartElement.style.display = "block"
      }

      // Cập nhật tiêu đề phần
      const partHeader = document.querySelector(".part-header h2")
      if (partHeader) {
        partHeader.innerHTML = `<i class="fas fa-list-ol"></i> Phần ${currentPart}`
      }

      // Nếu phần này chưa được hiển thị, hiển thị nó
      if (!nextPartElement.querySelector(".question-type-selector")) {
        renderQuestionTypes(nextPartElement)
        displayExistingQuestions(currentPart)
      }
    }
  }
}

// Cập nhật form metadata bài kiểm tra
function addTestMetadataForm() {
  const metadataForm = document.createElement("div")
  metadataForm.className = "test-metadata-form"
  metadataForm.innerHTML = `
  <div class="form-group">
    <label for="testTitle">Tiêu đề bài kiểm tra (Tiếng Anh):</label>
    <input type="text" id="testTitle" required 
      value="${test.title}"
      onchange="updateTestMetadata('title', this.value)">
  </div>
  <div class="form-group">
    <label for="testVietnameseName">Tên bộ câu hỏi (Tiếng Việt):</label>
    <input type="text" id="testVietnameseName" 
      value="${test.vietnameseName || ""}"
      onchange="updateTestMetadata('vietnameseName', this.value)">
  </div>
  <div class="form-group">
    <label for="testDescription">Mô tả (không bắt buộc):</label>
    <textarea id="testDescription" rows="2"
      onchange="updateTestMetadata('description', this.value)">${test.description}</textarea>
  </div>
`

  // Thêm form vào đầu nội dung bài kiểm tra
  const testContent = document.getElementById("testContent")
  if (testContent) {
    testContent.insertBefore(metadataForm, testContent.firstChild)
  } else {
    console.error("Không tìm thấy phần tử nội dung bài kiểm tra")
  }
}

// Cập nhật metadata bài kiểm tra
function updateTestMetadata(field, value) {
  test[field] = value
}

// Thiết lập xử lý âm thanh
function setupAudioHandlers() {
  // Thêm chức năng tải lên âm thanh nếu cần
  const audioUploadBtn = document.createElement("button")
  audioUploadBtn.id = "audioUploadBtn"
  audioUploadBtn.className = "action-button"
  audioUploadBtn.innerHTML = '<i class="fas fa-music"></i> Tải lên âm thanh'
  audioUploadBtn.addEventListener("click", () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "audio/*"
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        audioFile = file
        const audioPlayer = document.getElementById("audioPlayer") || document.createElement("audio")
        audioPlayer.id = "audioPlayer"
        audioPlayer.controls = true
        audioPlayer.src = URL.createObjectURL(file)

        // Thêm vào trang nếu chưa tồn tại
        if (!document.getElementById("audioPlayer")) {
          const audioContainer = document.createElement("div")
          audioContainer.id = "audioContainer"
          audioContainer.className = "audio-container"
          audioContainer.innerHTML = `<h3>Âm thanh bài kiểm tra</h3>`
          audioContainer.appendChild(audioPlayer)

          const testContent = document.getElementById("testContent")
          if (testContent) {
            testContent.insertBefore(audioContainer, testContent.firstChild)
          }
        }

        // Lấy thời lượng âm thanh khi metadata được tải
        audioPlayer.onloadedmetadata = () => {
          audioDuration = audioPlayer.duration
          const durationDisplay = document.createElement("div")
          durationDisplay.textContent = `Thời lượng: ${Math.floor(audioDuration / 60)}:${Math.floor(audioDuration % 60)
            .toString()
            .padStart(2, "0")}`
          const audioContainer = document.getElementById("audioContainer") // Declare audioContainer here
          audioContainer.appendChild(durationDisplay)
        }

        showNotification("Tải lên tệp âm thanh thành công", "success")
      }
    }
    input.click()
  })

  // Thêm vào trang
  const testCreationPage = document.getElementById("testCreationPage")
  if (testCreationPage) {
    testCreationPage.appendChild(audioUploadBtn)
  }
}

// Hiển thị thông báo
function showNotification(message, type = "info") {
  let notification = document.getElementById("notification")

  // Tạo phần tử thông báo nếu chưa tồn tại
  if (!notification) {
    notification = document.createElement("div")
    notification.id = "notification"
    document.body.appendChild(notification)
  }

  // Đặt nội dung và kiểu thông báo
  notification.textContent = message
  notification.className = `notification notification-${type}`
  notification.style.display = "block"

  // Thêm kiểu
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "4px",
    zIndex: "9999",
    maxWidth: "300px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  })

  if (type === "error") {
    Object.assign(notification.style, {
      backgroundColor: "#fee2e2",
      color: "#dc2626",
      border: "1px solid #dc2626",
    })
  } else if (type === "success") {
    Object.assign(notification.style, {
      backgroundColor: "#dcfce7",
      color: "#16a34a",
      border: "1px solid #16a34a",
    })
  }

  // Tự động ẩn sau 5 giây
  setTimeout(() => {
    if (notification) {
      notification.style.display = "none"
    }
  }, 5000)
}

// Define missing functions if they don't exist
function addAnswerInput() {
  console.log("addAnswerInput function called")
  // This is a placeholder - the actual implementation is in question-types.js
}

function removeAnswerInput(index) {
  console.log("removeAnswerInput function called with index:", index)
  // This is a placeholder - the actual implementation is in question-types.js
}

function saveQuestion() {
  console.log("saveQuestion function called")
  // This is a placeholder - the actual implementation is in form-handlers.js
}

function previewQuestion() {
  console.log("previewQuestion function called")
  // This is a placeholder - the actual implementation is in form-handlers.js
}

// Dummy functions to resolve undefined variable errors. Replace with actual implementations.
// function saveTest() {
//   console.warn("saveTest function is a placeholder.")
//   // Cập nhật tiêu đề, tên tiếng Việt và mô tả từ form
//   test.title = document.getElementById("testTitle").value
//   test.vietnameseName = document.getElementById("testVietnameseName").value
//   test.description = document.getElementById("testDescription").value
// }

// Hàm lưu bài kiểm tra
function saveTest() {
  try {
    console.log("Bắt đầu lưu bài kiểm tra...")

    // Đảm bảo sử dụng đối tượng test từ window
    const test = window.test

    // Kiểm tra xem đối tượng test có tồn tại không
    if (!test) {
      console.error("Lỗi: Đối tượng test không tồn tại")
      showNotification("Lỗi: Không tìm thấy dữ liệu bài kiểm tra", "error")
      return
    }

    // Đảm bảo tất cả các mảng part tồn tại
    for (let i = 1; i <= 4; i++) {
      if (!test[`part${i}`]) {
        test[`part${i}`] = []
        console.log(`Khởi tạo mảng trống cho part${i}`)
      }
    }

    // Cập nhật tiêu đề và mô tả từ form
    test.title = document.getElementById("testTitle")?.value || ""
    test.vietnameseName = document.getElementById("testVietnameseName")?.value || ""
    test.description = document.getElementById("testDescription")?.value || ""

    console.log("Đã lấy metadata từ form:", {
      title: test.title,
      vietnameseName: test.vietnameseName,
      description: test.description,
    })

    // Xác thực metadata bài kiểm tra trước
    console.log("Đang xác thực metadata bài kiểm tra...")
    const metadataValid = validateTestMetadata()
    console.log("Kết quả xác thực metadata:", metadataValid)
    if (!metadataValid) {
      console.error("Lỗi: Metadata bài kiểm tra không hợp lệ")
      return
    }

    console.log("Metadata bài kiểm tra hợp lệ, tiếp tục kiểm tra câu hỏi...")

    // Kiểm tra xem chúng ta có câu hỏi nào trong bất kỳ phần nào không
    let hasQuestions = false
    const questionCounts = {}

    // Debug cấu trúc đối tượng test
    console.log("Cấu trúc đối tượng test:", JSON.stringify(test, null, 2))

    for (let i = 1; i <= 4; i++) {
      const partQuestions = test[`part${i}`] || []
      questionCounts[`part${i}`] = partQuestions.length

      if (partQuestions.length > 0) {
        hasQuestions = true
        console.log(`Phần ${i}: Tìm thấy ${partQuestions.length} câu hỏi`)
      } else {
        console.log(`Phần ${i}: Không có câu hỏi`)
      }
    }

    console.log("Tổng số câu hỏi theo phần:", questionCounts)

    if (!hasQuestions) {
      console.error("Lỗi: Không tìm thấy câu hỏi nào trong tất cả các phần")
      showNotification("Không tìm thấy câu hỏi để lưu. Vui lòng thêm ít nhất một câu hỏi.", "error")
      return
    }

    console.log("Tất cả câu hỏi đều hợp lệ, chuẩn bị dữ liệu để gửi lên server...")

    // Chuẩn bị dữ liệu để gửi lên server
    const testData = {
      title: test.title,
      vietnameseName: test.vietnameseName || test.title,
      description: test.description || "",
      parts: [],
    }

    // Thêm dữ liệu từng phần
    for (let i = 1; i <= 4; i++) {
      if (test[`part${i}`] && test[`part${i}`].length > 0) {
        const partData = {
          part_number: i,
          questions: test[`part${i}`].map((question) => ({
            question_type: question.type,
            content: JSON.stringify(question.content),
            correct_answers: JSON.stringify(question.correctAnswers),
          })),
        }
        testData.parts.push(partData)
        console.log(`Đã thêm dữ liệu Phần ${i} với ${partData.questions.length} câu hỏi`)
      }
    }

    console.log("Dữ liệu bài kiểm tra sẽ gửi:", JSON.stringify(testData, null, 2))

    // Đảm bảo có token xác thực
    const token = window.ensureAuthToken ? window.ensureAuthToken() : localStorage.getItem("token")
    if (!token) {
      console.error("Lỗi: Không tìm thấy token xác thực")
      showNotification("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.", "error")
      return
    }
    console.log("Đã tìm thấy token xác thực:", token.substring(0, 20) + "...")

    console.log("Đã tìm thấy token xác thực, bắt đầu gửi dữ liệu lên server...")

    // Gửi dữ liệu lên server
    fetch("/api/tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(testData),
    })
      .then((response) => {
        console.log("Nhận phản hồi từ server:", {
          status: response.status,
          statusText: response.statusText,
        })

        if (!response.ok) {
          return response.json().then((data) => {
            console.error("Server trả về lỗi:", data)
            throw new Error(data.message || "Lỗi khi lưu bài kiểm tra")
          })
        }
        return response.json()
      })
      .then((data) => {
        console.log("Bài kiểm tra đã lưu vào server thành công:", data)
        showNotification(`Bài kiểm tra "${test.vietnameseName || test.title}" đã lưu thành công!`, "success")
      })
      .catch((error) => {
        console.error("Lỗi khi lưu bài kiểm tra vào server:", error)
        showNotification(`Lỗi khi lưu bài kiểm tra: ${error.message}`, "error")
      })
  } catch (error) {
    console.error("Lỗi ngoại lệ khi lưu bài kiểm tra:", error)
    showNotification(`Lỗi khi lưu bài kiểm tra: ${error.message}`, "error")
  }
}

function previewEntireTest() {
  console.warn("previewEntireTest function is a placeholder.")
}

function exportTest() {
  console.warn("exportTest function is a placeholder.")
}

function importTest() {
  console.warn("importTest function is a placeholder.")
}

function saveQuestionSet() {
  console.warn("saveQuestionSet function is a placeholder.")
}

function showTestList() {
  console.warn("showTestList function is a placeholder.")
}

function fetchQuestionTypes() {
  console.warn("fetchQuestionTypes function is a placeholder.")
}

function renderQuestionTypes(element) {
  console.warn("renderQuestionTypes function is a placeholder.")
}

function displayExistingQuestions(part) {
  console.warn("displayExistingQuestions function is a placeholder.")
}

// Hàm kiểm tra tính hợp lệ của metadata bài kiểm tra
function validateTestMetadata() {
  console.log("Bắt đầu xác thực metadata bài kiểm tra...")
  console.log("Metadata hiện tại:", {
    title: test.title,
    vietnameseName: test.vietnameseName,
    description: test.description,
  })

  // Kiểm tra tiêu đề bài kiểm tra
  if (!test.title || test.title.trim() === "") {
    showNotification("Vui lòng nhập tiêu đề bài kiểm tra (Tiếng Anh)", "error")
    document.getElementById("testTitle").focus()
    return false
  }

  // Kiểm tra độ dài tiêu đề
  if (test.title.length > 200) {
    showNotification("Tiêu đề bài kiểm tra quá dài (tối đa 200 ký tự)", "error")
    document.getElementById("testTitle").focus()
    return false
  }

  // Không bắt buộc phải có tên tiếng Việt
  // if (!test.vietnameseName || test.vietnameseName.trim() === "") {
  //   showNotification("Vui lòng nhập tên bài kiểm tra (Tiếng Việt)", "error");
  //   document.getElementById("testVietnameseName").focus();
  //   return false;
  // }

  // Kiểm tra tên tiếng Việt (không bắt buộc)
  if (test.vietnameseName && test.vietnameseName.length > 200) {
    showNotification("Tên tiếng Việt quá dài (tối đa 200 ký tự)", "error")
    document.getElementById("testVietnameseName").focus()
    return false
  }

  // Kiểm tra mô tả (không bắt buộc)
  if (test.description && test.description.length > 1000) {
    showNotification("Mô tả quá dài (tối đa 1000 ký tự)", "error")
    document.getElementById("testDescription").focus()
    return false
  }

  console.log("Xác thực metadata bài kiểm tra thành công")
  return true
}

// Hàm kiểm tra tính hợp lệ của câu hỏi trong các phần
function validatePartQuestions() {
  console.log("Bắt đầu xác thực câu hỏi trong các phần...")

  // Kiểm tra tổng số câu hỏi
  let totalQuestionCount = 0
  for (let i = 1; i <= 4; i++) {
    if (test[`part${i}`]) {
      totalQuestionCount += test[`part${i}`].length
    }
  }

  if (totalQuestionCount === 0) {
    showNotification("Vui lòng thêm ít nhất một câu hỏi vào bài kiểm tra", "error")
    return false
  }

  if (totalQuestionCount > MAX_QUESTIONS) {
    showNotification(`Số lượng câu hỏi vượt quá giới hạn (tối đa ${MAX_QUESTIONS} câu)`, "error")
    return false
  }

  // Kiểm tra từng phần
  for (let i = 1; i <= 4; i++) {
    if (test[`part${i}`] && test[`part${i}`].length > 0) {
      // Kiểm tra từng câu hỏi trong phần
      for (let j = 0; j < test[`part${i}`].length; j++) {
        const question = test[`part${i}`][j]

        // Log the question for debugging
        console.log(`Kiểm tra câu hỏi phần ${i}, câu ${j + 1}:`, question)

        // Kiểm tra loại câu hỏi
        if (!question.type) {
          showNotification(`Câu hỏi #${j + 1} trong Phần ${i} không có loại câu hỏi`, "error")
          return false
        }

        // Kiểm tra nội dung câu hỏi
        if (!question.content || !Array.isArray(question.content) || question.content.length === 0) {
          showNotification(`Câu hỏi #${j + 1} trong Phần ${i} không có nội dung hoặc nội dung không hợp lệ`, "error")
          return false
        }

        // Kiểm tra đáp án đúng
        if (
          question.correctAnswers === undefined ||
          question.correctAnswers === null ||
          (Array.isArray(question.correctAnswers) && question.correctAnswers.length === 0)
        ) {
          showNotification(`Câu hỏi #${j + 1} trong Phần ${i} không có đáp án đúng`, "error")
          return false
        }
      }
    }
  }

  console.log("Xác thực câu hỏi trong các phần thành công")
  return true
}

// Hàm kiểm tra câu hỏi trắc nghiệm
function validateMultipleChoiceQuestion(question, partIndex, questionIndex) {
  const content = question.content

  // Kiểm tra câu hỏi
  if (!content.question || content.question.trim() === "") {
    showNotification(`Câu hỏi #${questionIndex + 1} trong Phần ${partIndex} không có nội dung câu hỏi`, "error")
    return false
  }

  // Kiểm tra các lựa chọn
  if (!content.choices || !Array.isArray(content.choices) || content.choices.length < 2) {
    showNotification(`Câu hỏi #${questionIndex + 1} trong Phần ${partIndex} cần ít nhất 2 lựa chọn`, "error")
    return false
  }

  // Kiểm tra đáp án đúng
  const correctAnswer = question.correctAnswers
  if (correctAnswer === undefined || correctAnswer < 0 || correctAnswer >= content.choices.length) {
    showNotification(`Câu hỏi #${questionIndex + 1} trong Phần ${partIndex} có đáp án không hợp lệ`, "error")
    return false
  }

  return true
}

// Hàm kiểm tra câu hỏi nhiều đáp án
function validateMultipleAnswersQuestion(question, partIndex, questionIndex) {
  const content = question.content

  // Kiểm tra câu hỏi
  if (!content.question || content.question.trim() === "") {
    showNotification(`Câu hỏi #${questionIndex + 1} trong Phần ${partIndex} không có nội dung câu hỏi`, "error")
    return false
  }

  // Kiểm tra các lựa chọn
  if (!content.choices || !Array.isArray(content.choices) || content.choices.length < 2) {
    showNotification(`Câu hỏi #${questionIndex + 1} trong Phần ${partIndex} cần ít nhất 2 lựa chọn`, "error")
    return false
  }

  // Kiểm tra đáp án đúng
  const correctAnswers = question.correctAnswers
  if (!Array.isArray(correctAnswers) || correctAnswers.length === 0) {
    showNotification(`Câu hỏi #${questionIndex + 1} trong Phần ${partIndex} cần ít nhất 1 đáp án đúng`, "error")
    return false
  }

  // Kiểm tra tính hợp lệ của các đáp án
  for (const answer of correctAnswers) {
    if (answer < 0 || answer >= content.choices.length) {
      showNotification(`Câu hỏi #${questionIndex + 1} trong Phần ${partIndex} có đáp án không hợp lệ`, "error")
      return false
    }
  }

  return true
}

// Hàm kiểm tra câu hỏi ghép đôi
function validateMatchingQuestion(question, partIndex, questionIndex) {
  const content = question.content

  // Kiểm tra tiêu đề
  if (!content.title || content.title.trim() === "") {
    showNotification(`Câu hỏi ghép đôi #${questionIndex + 1} trong Phần ${partIndex} không có tiêu đề`, "error")
    return false
  }

  // Kiểm tra danh sách câu hỏi
  if (!content.questions || !Array.isArray(content.questions) || content.questions.length === 0) {
    showNotification(`Câu hỏi ghép đôi #${questionIndex + 1} trong Phần ${partIndex} không có câu hỏi`, "error")
    return false
  }

  // Kiểm tra danh sách từ khóa
  if (!content.keywords || !Array.isArray(content.keywords) || content.keywords.length === 0) {
    showNotification(`Câu hỏi ghép đôi #${questionIndex + 1} trong Phần ${partIndex} không có từ khóa`, "error")
    return false
  }

  // Kiểm tra đáp án
  const answers = question.correctAnswers
  if (!answers || typeof answers !== "object" || Object.keys(answers).length !== content.questions.length) {
    showNotification(`Câu hỏi ghép đôi #${questionIndex + 1} trong Phần ${partIndex} không có đủ đáp án`, "error")
    return false
  }

  // Kiểm tra tính hợp lệ của đáp án
  for (const [questionIdx, keywordIdx] of Object.entries(answers)) {
    if (keywordIdx < 0 || keywordIdx >= content.keywords.length) {
      showNotification(`Câu hỏi ghép đôi #${questionIndex + 1} trong Phần ${partIndex} có đáp án không hợp lệ`, "error")
      return false
    }
  }

  return true
}

// Hàm kiểm tra câu hỏi gắn nhãn bản đồ/sơ đồ
function validateMapLabelingQuestion(question, partIndex, questionIndex) {
  const content = question.content

  // Kiểm tra loại bản đồ
  if (!content.mapType || content.mapType.trim() === "") {
    showNotification(`Câu hỏi bản đồ #${questionIndex + 1} trong Phần ${partIndex} không có loại bản đồ`, "error")
    return false
  }

  // Kiểm tra hướng dẫn
  if (!content.instructions || content.instructions.trim() === "") {
    showNotification(`Câu hỏi bản đồ #${questionIndex + 1} trong Phần ${partIndex} không có hướng dẫn`, "error")
    return false
  }

  // Kiểm tra URL hình ảnh
  if (!content.imageUrl || content.imageUrl.trim() === "") {
    showNotification(`Câu hỏi bản đồ #${questionIndex + 1} trong Phần ${partIndex} không có URL hình ảnh`, "error")
    return false
  }

  // Kiểm tra danh sách nhãn
  if (!content.labels || !Array.isArray(content.labels) || content.labels.length === 0) {
    showNotification(`Câu hỏi bản đồ #${questionIndex + 1} trong Phần ${partIndex} không có nhãn`, "error")
    return false
  }

  // Kiểm tra đáp án
  const answers = question.correctAnswers
  if (!answers || typeof answers !== "object" || Object.keys(answers).length !== content.labels.length) {
    showNotification(`Câu hỏi bản đồ #${questionIndex + 1} trong Phần ${partIndex} không có đủ đáp án`, "error")
    return false
  }

  return true
}

// Hàm kiểm tra câu hỏi điền vào ghi chú
function validateNoteCompletionQuestion(question, partIndex, questionIndex) {
  const content = question.content

  // Kiểm tra hướng dẫn
  if (!content.instructions || content.instructions.trim() === "") {
    showNotification(`Câu hỏi ghi chú #${questionIndex + 1} trong Phần ${partIndex} không có hướng dẫn`, "error")
    return false
  }

  // Kiểm tra chủ đề
  if (!content.topic || content.topic.trim() === "") {
    showNotification(`Câu hỏi ghi chú #${questionIndex + 1} trong Phần ${partIndex} không có chủ đề`, "error")
    return false
  }

  // Kiểm tra danh sách ghi chú
  if (!content.notes || !Array.isArray(content.notes) || content.notes.length === 0) {
    showNotification(`Câu hỏi ghi chú #${questionIndex + 1} trong Phần ${partIndex} không có ghi chú`, "error")
    return false
  }

  // Đếm số lượng ghi chú có chỗ trống
  let blankCount = 0
  for (const note of content.notes) {
    if (note.hasBlank) {
      blankCount++
    }
  }

  if (blankCount === 0) {
    showNotification(`Câu hỏi ghi chú #${questionIndex + 1} trong Phần ${partIndex} không có chỗ trống nào`, "error")
    return false
  }

  // Kiểm tra đáp án
  const answers = question.correctAnswers
  if (!answers || typeof answers !== "object" || Object.keys(answers).length !== blankCount) {
    showNotification(`Câu hỏi ghi chú #${questionIndex + 1} trong Phần ${partIndex} không có đủ đáp án`, "error")
    return false
  }

  return true
}

// Hàm kiểm tra câu hỏi điền vào biểu mẫu
function validateFormCompletionQuestion(question, partIndex, questionIndex) {
  const content = question.content

  // Kiểm tra hướng dẫn
  if (!content.instructions || content.instructions.trim() === "") {
    showNotification(`Câu hỏi biểu mẫu #${questionIndex + 1} trong Phần ${partIndex} không có hướng dẫn`, "error")
    return false
  }

  // Kiểm tra danh sách hàng
  if (!content.rows || !Array.isArray(content.rows) || content.rows.length === 0) {
    showNotification(`Câu hỏi biểu mẫu #${questionIndex + 1} trong Phần ${partIndex} không có hàng nào`, "error")
    return false
  }

  // Đếm số lượng hàng có chỗ trống
  let blankCount = 0
  for (const row of content.rows) {
    if (row.hasBlank) {
      blankCount++
    }
  }

  if (blankCount === 0) {
    showNotification(`Câu hỏi biểu mẫu #${questionIndex + 1} trong Phần ${partIndex} không có chỗ trống nào`, "error")
    return false
  }

  // Kiểm tra đáp án
  const answers = question.correctAnswers
  if (!answers || typeof answers !== "object" || Object.keys(answers).length !== blankCount) {
    showNotification(`Câu hỏi biểu mẫu #${questionIndex + 1} trong Phần ${partIndex} không có đủ đáp án`, "error")
    return false
  }

  return true
}

// Hàm kiểm tra câu hỏi lưu đồ
function validateFlowChartQuestion(question, partIndex, questionIndex) {
  const content = question.content

  // Kiểm tra tiêu đề
  if (!content.title || content.title.trim() === "") {
    showNotification(`Câu hỏi lưu đồ #${questionIndex + 1} trong Phần ${partIndex} không có tiêu đề`, "error")
    return false
  }

  // Kiểm tra hướng dẫn
  if (!content.instructions || content.instructions.trim() === "") {
    showNotification(`Câu hỏi lưu đồ #${questionIndex + 1} trong Phần ${partIndex} không có hướng dẫn`, "error")
    return false
  }

  // Kiểm tra danh sách mục
  if (!content.items || !Array.isArray(content.items) || content.items.length === 0) {
    showNotification(`Câu hỏi lưu đồ #${questionIndex + 1} trong Phần ${partIndex} không có mục nào`, "error")
    return false
  }

  // Đếm số lượng mục có chỗ trống
  let blankCount = 0
  for (const item of content.items) {
    if (item.hasBlank) {
      blankCount++
    }
  }

  if (blankCount === 0) {
    showNotification(`Câu hỏi lưu đồ #${questionIndex + 1} trong Phần ${partIndex} không có chỗ trống nào`, "error")
    return false
  }

  // Kiểm tra đáp án
  const answers = question.correctAnswers
  if (!answers || typeof answers !== "object" || Object.keys(answers).length !== blankCount) {
    showNotification(`Câu hỏi lưu đồ #${questionIndex + 1} trong Phần ${partIndex} không có đủ đáp án`, "error")
    return false
  }

  // Kiểm tra các lựa chọn cho mỗi mục có chỗ trống
  if (!content.choices || typeof content.choices !== "object") {
    showNotification(
      `Câu hỏi lưu đồ #${questionIndex + 1} trong Phần ${partIndex} không có lựa chọn cho các mục`,
      "error",
    )
    return false
  }

  for (const item of content.items) {
    if (item.hasBlank) {
      const itemId = item.id
      if (!content.choices[itemId] || !Array.isArray(content.choices[itemId]) || content.choices[itemId].length < 2) {
        showNotification(
          `Mục "${item.text}" trong câu hỏi lưu đồ #${questionIndex + 1} Phần ${partIndex} cần ít nhất 2 lựa chọn`,
          "error",
        )
        return false
      }

      const answerIndex = answers[itemId]
      if (answerIndex === undefined || answerIndex < 0 || answerIndex >= content.choices[itemId].length) {
        showNotification(
          `Mục "${item.text}" trong câu hỏi lưu đồ #${questionIndex + 1} Phần ${partIndex} có đáp án không hợp lệ`,
          "error",
        )
        return false
      }
    }
  }

  return true
}

// Make sure these functions are exposed to the global window object
window.previousPart = previousPart
window.nextPart = nextPart
window.saveTest = saveTest
window.previewEntireTest = previewEntireTest
window.exportTest = exportTest
window.importTest = importTest
window.saveQuestionSet = saveQuestionSet
window.showTestList = showTestList
window.fetchQuestionTypes = fetchQuestionTypes
window.renderQuestionTypes = renderQuestionTypes
window.displayExistingQuestions = displayExistingQuestions
window.updateTestMetadata = updateTestMetadata
window.showNotification = showNotification
window.addAnswerInput = addAnswerInput
window.removeAnswerInput = removeAnswerInput
window.saveQuestion = saveQuestion
window.previewQuestion = previewQuestion
window.validateTestMetadata = validateTestMetadata
window.validatePartQuestions = validatePartQuestions

// Declare startTestCreation
function startTestCreation() {
  console.log("startTestCreation function called")
  // This is a placeholder - the actual implementation is likely in test-management.js
}

// Thêm hàm debug để kiểm tra đối tượng test
// Thêm vào cuối file:

// Hàm debug để kiểm tra đối tượng test
function debugTestObject() {
  console.log("=== DEBUG TEST OBJECT ===")
  console.log("window.test:", window.test)
  console.log("test (local variable):", test)
  console.log("Title:", test.title)
  console.log("Vietnamese Name:", test.vietnameseName)
  console.log("Description:", test.description)

  // Kiểm tra từng phần
  for (let i = 1; i <= 4; i++) {
    console.log(`Part ${i} questions:`, test[`part${i}`]?.length || 0)
  }

  // Kiểm tra DOM elements
  console.log("testTitle element:", document.getElementById("testTitle")?.value)
  console.log("testVietnameseName element:", document.getElementById("testVietnameseName")?.value)
  console.log("testDescription element:", document.getElementById("testDescription")?.value)

  showNotification("Đã in thông tin debug vào console", "info")
}

// Thêm nút debug vào giao diện
function addDebugButtons() {
  const testCreationPage = document.getElementById("testCreationPage")
  if (!testCreationPage) return

  // Nút debug đối tượng test
  const debugButton = document.createElement("button")
  debugButton.id = "debugObjectBtn"
  debugButton.className = "action-button"
  debugButton.style.backgroundColor = "#ff9800"
  debugButton.innerHTML = '<i class="fas fa-bug"></i> Debug Test Object'
  debugButton.addEventListener("click", debugTestObject)
  testCreationPage.appendChild(debugButton)

  // Nút đồng bộ metadata
  const syncButton = document.createElement("button")
  syncButton.id = "syncMetadataBtn"
  syncButton.className = "action-button"
  syncButton.style.backgroundColor = "#2196F3"
  syncButton.innerHTML = '<i class="fas fa-sync"></i> Đồng bộ Metadata'
  syncButton.addEventListener("click", syncTestMetadata)
  testCreationPage.appendChild(syncButton)

  // Nút debug câu hỏi
  const debugQuestionButton = document.createElement("button")
  debugQuestionButton.id = "debugQuestionBtn"
  debugQuestionButton.className = "action-button"
  debugQuestionButton.style.backgroundColor = "#9c27b0"
  debugQuestionButton.innerHTML = '<i class="fas fa-question-circle"></i> Debug Questions'
  debugQuestionButton.addEventListener("click", debugQuestionValidation)
  testCreationPage.appendChild(debugQuestionButton)
}

// Hàm đồng bộ metadata từ form vào đối tượng test
function syncTestMetadata() {
  try {
    const titleElement = document.getElementById("testTitle")
    const vietnameseNameElement = document.getElementById("testVietnameseName")
    const descriptionElement = document.getElementById("testDescription")

    if (titleElement) window.test.title = titleElement.value
    if (vietnameseNameElement) window.test.vietnameseName = vietnameseNameElement.value
    if (descriptionElement) window.test.description = descriptionElement.value

    // Đồng bộ biến test cục bộ với window.test
    test = window.test

    console.log("Đã đồng bộ metadata:", {
      title: test.title,
      vietnameseName: test.vietnameseName,
      description: test.description,
    })

    showNotification("Đã đồng bộ metadata thành công", "success")
  } catch (error) {
    console.error("Lỗi khi đồng bộ metadata:", error)
    showNotification("Lỗi khi đồng bộ metadata: " + error.message, "error")
  }
}

// Đảm bảo các hàm được xuất ra toàn cục
window.debugTestObject = debugTestObject
window.syncTestMetadata = syncTestMetadata
// Add this function to the end of the file to help debug question validation issues

// Hàm kiểm tra chi tiết câu hỏi
function debugQuestionValidation() {
  console.log("=== DEBUG QUESTION VALIDATION ===")

  // Kiểm tra từng phần
  for (let i = 1; i <= 4; i++) {
    console.log(`Kiểm tra phần ${i}:`)

    if (!test[`part${i}`] || test[`part${i}`].length === 0) {
      console.log(`  Phần ${i}: Không có câu hỏi`)
      continue
    }

    console.log(`  Phần ${i}: Có ${test[`part${i}`].length} câu hỏi`)

    // Kiểm tra từng câu hỏi
    test[`part${i}`].forEach((question, j) => {
      console.log(`  Câu hỏi #${j + 1}:`)
      console.log(`    Loại: ${question.type || "KHÔNG CÓ LOẠI"}`)
      console.log(
        `    Nội dung: ${Array.isArray(question.content) ? "Array[" + question.content.length + "]" : typeof question.content}`,
      )
      if (Array.isArray(question.content) && question.content.length > 0) {
        console.log(`    Nội dung đầu tiên: ${question.content[0]}`)
      }
      console.log(
        `    Đáp án: ${
          Array.isArray(question.correctAnswers)
            ? "Array[" + question.correctAnswers.length + "]"
            : typeof question.correctAnswers
        }`,
      )

      // Kiểm tra chi tiết
      const issues = []

      if (!question.type) issues.push("Thiếu loại câu hỏi")
      if (!question.content) issues.push("Thiếu nội dung")
      else if (!Array.isArray(question.content)) issues.push("Nội dung không phải là mảng")
      else if (question.content.length === 0) issues.push("Mảng nội dung rỗng")

      if (question.correctAnswers === undefined || question.correctAnswers === null) issues.push("Thiếu đáp án")
      else if (Array.isArray(question.correctAnswers) && question.correctAnswers.length === 0)
        issues.push("Mảng đáp án rỗng")

      if (issues.length > 0) {
        console.log(`    VẤN ĐỀ: ${issues.join(", ")}`)
      } else {
        console.log(`    Hợp lệ: OK`)
      }
    })
  }

  showNotification("Đã in thông tin kiểm tra câu hỏi vào console", "info")
}

// Đảm bảo các hàm được xuất ra toàn cục
window.debugQuestionValidation = debugQuestionValidation
