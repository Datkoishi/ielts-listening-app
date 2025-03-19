// Khai báo các biến toàn cục
const selectedTypes = [] // Mảng chứa các loại câu hỏi đã chọn
const currentPart = 1 // Phần hiện tại của bài kiểm tra
let totalQuestions = 0 // Tổng số câu hỏi đã thêm
const MAX_QUESTIONS = 40 // Số lượng câu hỏi tối đa cho phép
const test = {} // Khai báo biến test

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
      <button class="add-question-btn" onclick="addQuestion('${type}', ${currentPart})">
        <i class="fas fa-plus"></i> Thêm câu hỏi ${type}
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

// Thêm câu hỏi mới
function addQuestion(type, partNumber) {
  if (totalQuestions >= MAX_QUESTIONS) {
    alert("Bạn đã đạt đến giới hạn tối đa 40 câu hỏi.")
    return
  }

  const part = document.getElementById(`part${partNumber}`)
  const questionNumber = totalQuestions + 1
  const questionDiv = document.createElement("div")
  questionDiv.className = "question"

  // Thêm tiêu đề loại câu hỏi
  const typeHeader = document.createElement("h3")
  typeHeader.innerHTML = `${getIconForType(type)} ${type}`
  questionDiv.appendChild(typeHeader)

  // Thêm số câu hỏi và nút xóa
  questionDiv.innerHTML += `
    <h4><i class="fas fa-question-circle"></i> Câu hỏi ${questionNumber}</h4>
    <button class="delete-question" onclick="deleteQuestion(this)"><i class="fas fa-trash"></i></button>
  `

  // Thêm form phù hợp dựa trên loại
  switch (type) {
    case "Một đáp án":
      questionDiv.innerHTML += createOneAnswerForm()
      break
    case "Nhiều đáp án":
      questionDiv.innerHTML += createMultipleAnswerForm()
      break
    case "Ghép nối":
      questionDiv.innerHTML += createMatchingForm()
      break
    case "Ghi nhãn Bản đồ/Sơ đồ":
      questionDiv.innerHTML += createPlanMapDiagramForm()
      break
    case "Hoàn thành ghi chú":
      questionDiv.innerHTML += createNoteCompletionForm()
      break
    case "Hoàn thành bảng/biểu mẫu":
      questionDiv.innerHTML += createFormTableCompletionForm()
      break
    case "Hoàn thành lưu đồ":
      questionDiv.innerHTML += createFlowChartCompletionForm()
      break
    default:
      console.error("Loại câu hỏi không xác định:", type)
      return
  }

  part.appendChild(questionDiv)
  totalQuestions++
  updateQuestionCount()

  // Khởi tạo chức năng form dựa trên loại
  switch (type) {
    case "Một đáp án":
      initializeOneAnswerForm(questionDiv)
      break
    case "Nhiều đáp án":
      initializeMultipleAnswerForm(questionDiv)
      break
    case "Ghép nối":
      initializeMatchingForm(questionDiv)
      break
    case "Ghi nhãn Bản đồ/Sơ đồ":
      initializePlanMapDiagram(questionDiv)
      break
    case "Hoàn thành ghi chú":
      initializeNoteCompletionForm(questionDiv)
      break
    case "Hoàn thành bảng/biểu mẫu":
      initializeFormTableCompletionForm(questionDiv)
      break
    case "Hoàn thành lưu đồ":
      initializeFlowChartCompletionForm(questionDiv)
      break
  }
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
  if (index !== -1 && test[`part${partNumber}`] && test[`part${partNumber}`][index]) {
    test[`part${partNumber}`].splice(index, 1)
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

  const existingQuestions = test[`part${partNumber}`] || []

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

// Các hàm tạo form cho từng loại câu hỏi
function createOneAnswerForm() {
  return `
    <div class="one-answer-form">
      <label for="question">Câu hỏi:</label>
      <input type="text" id="question" name="question" required>
      <label>Lựa chọn:</label>
      <input type="text" name="option1" required><br>
      <input type="text" name="option2" required><br>
      <input type="text" name="option3" required><br>
      <input type="text" name="option4" required><br>
      <label for="correctAnswer">Đáp án đúng:</label>
      <select id="correctAnswer" name="correctAnswer" required>
        <option value="1">Lựa chọn 1</option>
        <option value="2">Lựa chọn 2</option>
        <option value="3">Lựa chọn 3</option>
        <option value="4">Lựa chọn 4</option>
      </select>
    </div>
  `
}

function createMultipleAnswerForm() {
  return `
    <div class="multiple-answer-form">
      <label for="question">Câu hỏi:</label>
      <input type="text" id="question" name="question" required>
      <label>Lựa chọn:</label>
      <input type="text" name="option1" required><br>
      <input type="text" name="option2" required><br>
      <input type="text" name="option3" required><br>
      <input type="text" name="option4" required><br>
      <label for="correctAnswers">Đáp án đúng (chọn nhiều):</label><br>
      <input type="checkbox" id="correctAnswer1" name="correctAnswers" value="1">
      <label for="correctAnswer1">Lựa chọn 1</label><br>
      <input type="checkbox" id="correctAnswer2" name="correctAnswers" value="2">
      <label for="correctAnswer2">Lựa chọn 2</label><br>
      <input type="checkbox" id="correctAnswer3" name="correctAnswers" value="3">
      <label for="correctAnswer3">Lựa chọn 3</label><br>
      <input type="checkbox" id="correctAnswer4" name="correctAnswers" value="4">
      <label for="correctAnswer4">Lựa chọn 4</label>
    </div>
  `
}

function createMatchingForm() {
  return `
    <div class="matching-form">
      <label for="title">Tiêu đề:</label>
      <input type="text" id="title" name="title" required>
      <label>Mục:</label>
      <input type="text" name="item1" required><br>
      <input type="text" name="item2" required><br>
      <input type="text" name="item3" required><br>
      <label>Ghép nối:</label>
      <input type="text" name="match1" required><br>
      <input type="text" name="match2" required><br>
      <input type="text" name="match3" required><br>
      <label for="correctMatches">Ghép nối đúng (ví dụ: 1-A, 2-B, 3-C):</label>
      <input type="text" id="correctMatches" name="correctMatches" required>
    </div>
  `
}

function createPlanMapDiagramForm() {
  return `
    <div class="plan-map-diagram-form">
      <label for="type">Loại:</label>
      <input type="text" id="type" name="type" required>
      <label for="instructions">Hướng dẫn:</label>
      <input type="text" id="instructions" name="instructions" required>
      <label for="image">Hình ảnh:</label>
      <input type="file" id="image" name="image" accept="image/*" required>
      <label for="labels">Nhãn (cách nhau bằng dấu phẩy):</label>
      <input type="text" id="labels" name="labels" required>
      <label for="correctAnswers">Đáp án đúng (ví dụ: A, B, C):</label>
      <input type="text" id="correctAnswers" name="correctAnswers" required>
    </div>
  `
}

function createNoteCompletionForm() {
  return `
    <div class="note-completion-form">
      <label for="instructions">Hướng dẫn:</label>
      <input type="text" id="instructions" name="instructions" required>
      <label for="topic">Chủ đề:</label>
      <input type="text" id="topic" name="topic" required>
      <label>Ghi chú (sử dụng [ANSWER] cho chỗ trống):</label>
      <textarea name="note1" required></textarea><br>
      <textarea name="note2" required></textarea><br>
      <textarea name="note3" required></textarea><br>
      <label for="correctAnswers">Đáp án đúng (cách nhau bằng dấu phẩy):</label>
      <input type="text" id="correctAnswers" name="correctAnswers" required>
    </div>
  `
}

function createFormTableCompletionForm() {
  return `
    <div class="form-table-completion-form">
      <label for="instructions">Hướng dẫn:</label>
      <input type="text" id="instructions" name="instructions" required>
      <label>Hàng 1 (cách nhau bằng dấu phẩy):</label>
      <input type="text" name="row1" required><br>
      <label>Hàng 2 (cách nhau bằng dấu phẩy):</label>
      <input type="text" name="row2" required><br>
      <label>Hàng 3 (cách nhau bằng dấu phẩy):</label>
      <input type="text" name="row3" required><br>
      <label for="correctAnswers">Đáp án đúng (cách nhau bằng dấu phẩy):</label>
      <input type="text" id="correctAnswers" name="correctAnswers" required>
    </div>
  `
}

function createFlowChartCompletionForm() {
  return `
    <div class="flow-chart-completion-form">
      <label for="title">Tiêu đề:</label>
      <input type="text" id="title" name="title" required>
      <label for="instructions">Hướng dẫn:</label>
      <input type="text" id="instructions" name="instructions" required>
      <label>Mục (sử dụng ___ cho chỗ trống):</label>
      <input type="text" name="item1" required><br>
      <input type="text" name="item2" required><br>
      <input type="text" name="item3" required><br>
      <label for="options">Lựa chọn (cách nhau bằng dấu phẩy):</label>
      <input type="text" id="options" name="options" required>
      <label for="correctAnswers">Đáp án đúng (cách nhau bằng dấu phẩy):</label>
      <input type="text" id="correctAnswers" name="correctAnswers" required>
    </div>
  `
}

// Các hàm khởi tạo form cho từng loại câu hỏi (nếu cần)
function initializeOneAnswerForm(questionDiv) {
  // Thêm logic khởi tạo nếu cần
}

function initializeMultipleAnswerForm(questionDiv) {
  // Thêm logic khởi tạo nếu cần
}

function initializeMatchingForm(questionDiv) {
  // Thêm logic khởi tạo nếu cần
}

function initializePlanMapDiagram(questionDiv) {
  // Thêm logic khởi tạo nếu cần
}

function initializeNoteCompletionForm(questionDiv) {
  // Thêm logic khởi tạo nếu cần
}

function initializeFormTableCompletionForm(questionDiv) {
  // Thêm logic khởi tạo nếu cần
}

function initializeFlowChartCompletionForm(questionDiv) {
  // Thêm logic khởi tạo nếu cần
}

