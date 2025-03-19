// Hằng số
const MAX_QUESTIONS = 40
const PARTS = 4

// Biến toàn cục
let selectedTypes = []
let currentPart = 1
const totalQuestions = 0
let audioFile = null
let audioDuration = 0

// Thêm metadata cho đối tượng bài kiểm tra
const test = {
  title: "",
  description: "",
  part1: [],
  part2: [],
  part3: [],
  part4: [],
}

// Khởi tạo sự kiện khi trang được tải
document.addEventListener("DOMContentLoaded", () => {
  // Thêm sự kiện cho các nút chính
  const startTestBtn = document.getElementById("startTestBtn")
  if (startTestBtn) {
    startTestBtn.addEventListener("click", startTestCreation)
  }

  const previousPartBtn = document.getElementById("previousPartBtn")
  if (previousPartBtn) {
    previousPartBtn.addEventListener("click", previousPart)
  }

  const nextPartBtn = document.getElementById("nextPartBtn")
  if (nextPartBtn) {
    nextPartBtn.addEventListener("click", nextPart)
  }

  const saveTestBtn = document.getElementById("saveTestBtn")
  if (saveTestBtn) {
    saveTestBtn.addEventListener("click", saveTest)
  }

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
})

// Bắt đầu quá trình tạo bài kiểm tra
function startTestCreation() {
  selectedTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value)
  if (selectedTypes.length === 0) {
    alert("Vui lòng chọn ít nhất một loại câu hỏi.")
    return
  }
  document.getElementById("selectionPage").classList.add("hidden")
  document.getElementById("testCreationPage").classList.remove("hidden")
  renderTestCreation()
}

// Hiển thị giao diện tạo bài kiểm tra
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

// Chuyển đến phần trước
function previousPart() {
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

// Chuyển đến phần tiếp theo
function nextPart() {
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

// Cập nhật form metadata bài kiểm tra
function addTestMetadataForm() {
  const metadataForm = document.createElement("div")
  metadataForm.className = "test-metadata-form"
  metadataForm.innerHTML = `
    <div class="form-group">
      <label for="testTitle">Tiêu đề bài kiểm tra:</label>
      <input type="text" id="testTitle" required 
        value="${test.title}"
        onchange="updateTestMetadata('title', this.value)">
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

// Dummy functions to resolve undefined variable errors. Replace with actual implementations.
function saveTest() {
  console.warn("saveTest function is a placeholder.")
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

