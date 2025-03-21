// Khai báo các biến toàn cục
const selectedTypes = [] // Mảng chứa các loại câu hỏi đã chọn
// let currentPart = 1 // Phần hiện tại của bài kiểm tra - Sử dụng window.currentPart thay thế
let totalQuestions = 0 // Tổng số câu hỏi đã thêm
const MAX_QUESTIONS = 40 // Số lượng câu hỏi tối đa cho phép
// const test = {} // Khai báo biến test - Sử dụng biến test từ test-management.js

// Lấy danh sách loại câu hỏi từ server hoặc sử dụng danh sách đã định nghĩa
function fetchQuestionTypes() {
  const questionTypes = [
    "Một đáp án",
    "Nhiều đáp án",
    "Ghép nối",
    "Ghi nhãn Bản đồ/Sơ đồ",
    "Hoàn thành ghi chú",
    "Hoàn thành bảng/biểu mẫu",
    "Hoàn thành lưu đồ",
  ]
  const questionTypeContainer = document.getElementById("questionTypes")

  if (!questionTypeContainer) {
    console.error("Không tìm thấy container loại câu hỏi")
    return
  }

  questionTypeContainer.innerHTML = ""

  questionTypes.forEach((type) => {
    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.value = type
    checkbox.id = type.replace(/\s+/g, "-").toLowerCase()
    checkbox.className = "question-type-checkbox"

    const label = document.createElement("label")
    label.htmlFor = checkbox.id
    label.textContent = type
    label.className = "question-type-label"

    const typeContainer = document.createElement("div")
    typeContainer.className = "question-type-item"
    typeContainer.appendChild(checkbox)
    typeContainer.appendChild(label)

    questionTypeContainer.appendChild(typeContainer)
  })
}

// Hiển thị loại câu hỏi để lựa chọn
function renderQuestionTypes(container) {
  selectedTypes.forEach((type) => {
    const questionDiv = document.createElement("div")
    questionDiv.className = "question-type-selector"
    questionDiv.innerHTML = `
      <h3>${getIconForType(type)} ${type}</h3>
      <button class="add-question-btn" onclick="createNewQuestionDirectly('${type}')">
        <i class="fas fa-plus"></i> Thêm câu hỏi
      </button>
    `
    container.appendChild(questionDiv)
  })
}

// Lấy biểu tượng cho loại câu hỏi
function getIconForType(type) {
  const icons = {
    "Một đáp án": '<i class="fas fa-check-circle"></i>',
    "Nhiều đáp án": '<i class="fas fa-check-double"></i>',
    "Ghép nối": '<i class="fas fa-link"></i>',
    "Ghi nhãn Bản đồ/Sơ đồ": '<i class="fas fa-map-marker-alt"></i>',
    "Hoàn thành ghi chú": '<i class="fas fa-sticky-note"></i>',
    "Hoàn thành bảng/biểu mẫu": '<i class="fas fa-table"></i>',
    "Hoàn thành lưu đồ": '<i class="fas fa-project-diagram"></i>',
  }
  return icons[type] || '<i class="fas fa-question"></i>'
}

// Xóa câu hỏi
function deleteQuestion(button) {
  const questionDiv = button.closest(".question")
  const partDiv = questionDiv.closest(".part")
  const partNumber = Number.parseInt(partDiv.id.replace("part", ""))

  // Tìm chỉ mục của câu hỏi này trong phần
  const questions = Array.from(partDiv.querySelectorAll(".question"))
  const index = questions.indexOf(questionDiv)

  // Xóa khỏi đối tượng bài kiểm tra nếu là câu hỏi hiện có
  if (index !== -1 && window.test && window.test[`part${partNumber}`] && window.test[`part${partNumber}`][index]) {
    window.test[`part${partNumber}`].splice(index, 1)
  }

  questionDiv.remove()
  totalQuestions--
  updateQuestionCount()
  renumberQuestions()
}

// Đánh số lại câu hỏi sau khi xóa
function renumberQuestions() {
  const questions = document.querySelectorAll(".question h4")
  questions.forEach((question, index) => {
    question.innerHTML = `<i class="fas fa-question-circle"></i> Câu hỏi ${index + 1}`
  })
}

// Cập nhật hiển thị số lượng câu hỏi
function updateQuestionCount() {
  const countElement = document.querySelector(".question-count")
  if (countElement) {
    countElement.innerHTML = `<i class="fas fa-question-circle"></i> Tổng số câu hỏi: ${totalQuestions}/${MAX_QUESTIONS}`
  }
}

// Hiển thị câu hỏi hiện có cho một phần
function displayExistingQuestions(partNumber) {
  const partElement = document.getElementById(`part${partNumber}`)
  if (!partElement) return

  const existingQuestions = window.test && window.test[`part${partNumber}`] ? window.test[`part${partNumber}`] : []

  existingQuestions.forEach((question, index) => {
    const questionDiv = document.createElement("div")
    questionDiv.className = "question existing-question"

    // Thêm tiêu đề câu hỏi
    questionDiv.innerHTML = `
      <h3>${getIconForType(question.type)} ${question.type}</h3>
      <h4><i class="fas fa-question-circle"></i> Câu hỏi ${index + 1}</h4>
      <button class="delete-question" onclick="deleteQuestion(this)"><i class="fas fa-trash"></i></button>
      <div class="question-content">
        ${renderQuestionContent(question)}
      </div>
    `

    partElement.appendChild(questionDiv)
  })
}

// Hiển thị nội dung câu hỏi dựa trên loại
function renderQuestionContent(question) {
  switch (question.type) {
    case "Một đáp án":
      return `
        <p><strong>Câu hỏi:</strong> ${question.content[0]}</p>
        <p><strong>Lựa chọn:</strong></p>
        <ul>
          ${question.content
            .slice(1)
            .map((option) => `<li>${option}</li>`)
            .join("")}
        </ul>
        <p><strong>Đáp án đúng:</strong> ${question.correctAnswers}</p>
      `
    case "Nhiều đáp án":
      return `
        <p><strong>Câu hỏi:</strong> ${question.content[0]}</p>
        <p><strong>Lựa chọn:</strong></p>
        <ul>
          ${question.content
            .slice(1)
            .map((option) => `<li>${option}</li>`)
            .join("")}
        </ul>
        <p><strong>Đáp án đúng:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    case "Ghép nối":
      return `
        <p><strong>Tiêu đề:</strong> ${question.content[0]}</p>
        <div class="matching-preview">
          <div class="matching-column">
            <h5>Mục</h5>
            <ul>
              ${question.content
                .slice(1, Math.ceil(question.content.length / 2))
                .map((item) => `<li>${item}</li>`)
                .join("")}
            </ul>
          </div>
          <div class="matching-column">
            <h5>Ghép nối</h5>
            <ul>
              ${question.content
                .slice(Math.ceil(question.content.length / 2))
                .map((item) => `<li>${item}</li>`)
                .join("")}
            </ul>
          </div>
        </div>
        <p><strong>Ghép nối đúng:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    case "Ghi nhãn Bản đồ/Sơ đồ":
      return `
        <p><strong>Loại:</strong> ${question.content[0]}</p>
        <p><strong>Hướng dẫn:</strong> ${question.content[1]}</p>
        <div class="image-preview">
          <img src="${question.content[2]}" alt="Sơ đồ" style="max-width: 200px;">
        </div>
        <p><strong>Nhãn:</strong> ${question.content.slice(3).join(", ")}</p>
        <p><strong>Đáp án đúng:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    case "Hoàn thành ghi chú":
      return `
        <p><strong>Hướng dẫn:</strong> ${question.content[0]}</p>
        <p><strong>Chủ đề:</strong> ${question.content[1]}</p>
        <div class="notes-preview">
          ${question.content
            .slice(2)
            .map((note, i) => `<p>${i + 1}. ${note.replace(/\[ANSWER\]/g, "_______")}</p>`)
            .join("")}
        </div>
        <p><strong>Đáp án đúng:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    case "Hoàn thành bảng/biểu mẫu":
      return `
        <p><strong>Hướng dẫn:</strong> ${question.content[0]}</p>
        <div class="table-preview">
          <table>
            <tr>
              <th>Cột 1</th>
              <th>Cột 2</th>
              <th>Cột 3</th>
            </tr>
            ${renderTableRows(question.content.slice(1))}
          </table>
        </div>
        <p><strong>Đáp án đúng:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    case "Hoàn thành lưu đồ":
      return `
        <p><strong>Tiêu đề:</strong> ${question.content[0]}</p>
        <p><strong>Hướng dẫn:</strong> ${question.content[1]}</p>
        <div class="flowchart-preview">
          ${question.content
            .slice(2, question.content.length / 2)
            .map((item) => `<div class="flow-item">${item.replace(/___/g, "_______")}</div>`)
            .join('<div class="flow-arrow">↓</div>')}
        </div>
        <p><strong>Lựa chọn:</strong> ${question.content.slice(question.content.length / 2).join(", ")}</p>
        <p><strong>Đáp án đúng:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    default:
      return `<p>Loại câu hỏi không xác định: ${question.type}</p>`
  }
}

// Hàm trợ giúp để hiển thị hàng bảng
function renderTableRows(data) {
  let rows = ""
  for (let i = 0; i < data.length; i += 3) {
    rows += `
      <tr>
        <td>${data[i] || ""}</td>
        <td>${data[i + 1] || ""}</td>
        <td>${data[i + 2] || ""}</td>
      </tr>
    `
  }
  return rows
}

// Make sure these functions are exposed to the global window object
window.fetchQuestionTypes = fetchQuestionTypes
window.renderQuestionTypes = renderQuestionTypes
window.getIconForType = getIconForType
window.displayExistingQuestions = displayExistingQuestions
window.updateQuestionCount = updateQuestionCount
window.renumberQuestions = renumberQuestions

