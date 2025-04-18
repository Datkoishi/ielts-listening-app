import * as bootstrap from "bootstrap"

document.addEventListener("DOMContentLoaded", () => {
  // Lấy ID bài thi từ URL
  const urlParams = new URLSearchParams(window.location.search)
  const testId = urlParams.get("id")

  if (!testId) {
    window.location.href = "index.html"
    return
  }

  // Lấy thông tin bài thi
  fetchTest(testId)

  // Xử lý sự kiện nộp bài
  document.getElementById("submit-test").addEventListener("click", () => {
    submitTest(testId)
  })
})

// Biến lưu trữ dữ liệu bài thi
let testData = null
const studentAnswers = {}

// Lấy thông tin bài thi từ API
async function fetchTest(testId) {
  try {
    const response = await fetch(`/api/tests/public/${testId}`)
    if (!response.ok) {
      throw new Error("Không thể lấy thông tin bài thi")
    }

    testData = await response.json()
    displayTest(testData)
  } catch (error) {
    console.error("Lỗi:", error)
    document.getElementById("questions-container").innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Lỗi!</h4>
                <p>Không thể tải thông tin bài thi. Vui lòng thử lại sau.</p>
                <hr>
                <p class="mb-0">Chi tiết lỗi: ${error.message}</p>
            </div>
        `
  }
}

// Hiển thị thông tin bài thi
function displayTest(test) {
  // Cập nhật tiêu đề và mô tả
  document.getElementById("test-title").textContent = test.title
  document.getElementById("test-description").textContent = test.description || ""
  document.title = `${test.title} - IELTS Listening Test`

  // Hiển thị các phần và câu hỏi
  const container = document.getElementById("questions-container")
  container.innerHTML = ""

  let totalQuestions = 0

  test.parts.forEach((part) => {
    // Tạo tiêu đề phần
    const partElement = document.createElement("div")
    partElement.className = "mb-4"
    partElement.innerHTML = `
            <h2 class="part-title">Part ${part.part_number}</h2>
        `

    // Thêm audio nếu có
    if (part.audio_url) {
      const audioElement = document.createElement("div")
      audioElement.className = "card mb-4 shadow-sm"
      audioElement.innerHTML = `
                <div class="card-body">
                    <audio controls class="w-100">
                        <source src="${part.audio_url}" type="audio/mpeg">
                        Trình duyệt của bạn không hỗ trợ phát audio.
                    </audio>
                </div>
            `
      partElement.appendChild(audioElement)
    }

    // Thêm các câu hỏi
    part.questions.forEach((question) => {
      totalQuestions++
      const questionElement = createQuestionElement(question, part.part_number)
      partElement.appendChild(questionElement)
    })

    container.appendChild(partElement)
  })

  // Cập nhật thông tin số câu hỏi
  document.getElementById("total-questions").textContent = totalQuestions
  document.getElementById("unanswered-questions").textContent = totalQuestions

  // Kích hoạt nút nộp bài
  document.getElementById("submit-test").disabled = false

  // Khởi tạo sự kiện theo dõi câu trả lời
  initializeAnswerTracking()
}

// Tạo phần tử HTML cho câu hỏi
function createQuestionElement(question, partNumber) {
  const questionElement = document.createElement("div")
  questionElement.className = "card question-card"
  questionElement.dataset.questionId = question.id

  let questionContent = ""

  // Tiêu đề câu hỏi
  questionContent += `
        <div class="card-header">
            <h3 class="h6 mb-0">Question ${question.id}</h3>
        </div>
        <div class="card-body">
    `

  // Nội dung câu hỏi dựa vào loại
  switch (question.question_type) {
    case "single_choice":
      questionContent += createSingleChoiceQuestion(question)
      break
    case "multiple_choice":
      questionContent += createMultipleChoiceQuestion(question)
      break
    case "matching":
      questionContent += createMatchingQuestion(question)
      break
    case "map_labeling":
      questionContent += createMapLabelingQuestion(question)
      break
    case "note_completion":
      questionContent += createNoteCompletionQuestion(question)
      break
    case "form_completion":
      questionContent += createFormCompletionQuestion(question)
      break
    case "flow_chart":
      questionContent += createFlowChartQuestion(question)
      break
    default:
      questionContent += `<p>Loại câu hỏi không được hỗ trợ: ${question.question_type}</p>`
  }

  questionContent += "</div>"
  questionElement.innerHTML = questionContent

  return questionElement
}

// Tạo câu hỏi một đáp án
function createSingleChoiceQuestion(question) {
  const { content } = question
  let html = `
        <div class="question-content">
            <p>${content.question}</p>
        </div>
        <div class="options">
    `

  content.options.forEach((option, index) => {
    html += `
            <div class="form-check">
                <input class="form-check-input" type="radio" name="question_${question.id}" id="question_${question.id}_option_${index}" value="${option}" data-question-id="${question.id}">
                <label class="form-check-label" for="question_${question.id}_option_${index}">
                    ${option}
                </label>
            </div>
        `
  })

  html += "</div>"
  return html
}

// Tạo câu hỏi nhiều đáp án
function createMultipleChoiceQuestion(question) {
  const { content } = question
  let html = `
        <div class="question-content">
            <p>${content.question}</p>
        </div>
        <div class="options">
    `

  content.options.forEach((option, index) => {
    html += `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" name="question_${question.id}" id="question_${question.id}_option_${index}" value="${option}" data-question-id="${question.id}">
                <label class="form-check-label" for="question_${question.id}_option_${index}">
                    ${option}
                </label>
            </div>
        `
  })

  html += "</div>"
  return html
}

// Tạo câu hỏi ghép nối
function createMatchingQuestion(question) {
  const { content } = question
  let html = `
        <div class="question-content">
            <p>${content.title || "Ghép nối các mục sau:"}</p>
        </div>
        <div class="row">
            <div class="col-md-6">
                <ul class="list-group mb-3">
    `

  content.questions.forEach((item, index) => {
    html += `<li class="list-group-item">${index + 1}. ${item}</li>`
  })

  html += `
                </ul>
            </div>
            <div class="col-md-6">
    `

  content.questions.forEach((_, index) => {
    html += `
            <div class="mb-3">
                <label for="question_${question.id}_match_${index}" class="form-label">${index + 1}.</label>
                <select class="form-select" id="question_${question.id}_match_${index}" data-question-id="${question.id}" data-index="${index}">
                    <option value="">-- Chọn --</option>
        `

    content.options.forEach((option, optionIndex) => {
      html += `<option value="${option}">${option}</option>`
    })

    html += `
                </select>
            </div>
        `
  })

  html += "</div></div>"
  return html
}

// Tạo câu hỏi ghi nhãn bản đồ/sơ đồ
function createMapLabelingQuestion(question) {
  const { content } = question
  let html = `
        <div class="question-content">
            <p>${content.instructions || "Điền các nhãn vào bản đồ/sơ đồ:"}</p>
        </div>
        <div class="map-label-container mb-3">
            <img src="${content.imageUrl || "/placeholder-map.jpg"}" alt="Map/Diagram" class="map-image mb-3">
        </div>
    `

  content.labels.forEach((label, index) => {
    html += `
            <div class="mb-3">
                <label for="question_${question.id}_label_${index}" class="form-label">${index + 1}. ${label.text}</label>
                <input type="text" class="form-control" id="question_${question.id}_label_${index}" data-question-id="${question.id}" data-index="${index}">
            </div>
        `
  })

  return html
}

// Tạo câu hỏi hoàn thành ghi chú
function createNoteCompletionQuestion(question) {
  const { content } = question
  let html = `
        <div class="question-content">
            <p>${content.instructions || "Hoàn thành các ghi chú sau:"}</p>
            <h4>${content.topic || "Chủ đề"}</h4>
        </div>
        <div class="notes-container">
    `

  content.notes.forEach((note, index) => {
    html += `
            <div class="mb-3">
                <p>${note.text.replace("___", `<input type="text" class="form-control d-inline-block" style="width: 150px;" id="question_${question.id}_note_${index}" data-question-id="${question.id}" data-index="${index}">`)}</p>
            </div>
        `
  })

  html += "</div>"
  return html
}

// Tạo câu hỏi hoàn thành biểu mẫu
function createFormCompletionQuestion(question) {
  const { content } = question
  let html = `
        <div class="question-content">
            <p>${content.instructions || "Hoàn thành biểu mẫu sau:"}</p>
        </div>
        <div class="table-responsive">
            <table class="table table-bordered table-form">
                <tbody>
    `

  content.rows.forEach((row, index) => {
    html += "<tr>"
    if (row.label) {
      html += `<td>${row.label}</td>`
    }

    if (row.isInput) {
      html += `<td><input type="text" class="form-control" id="question_${question.id}_form_${index}" data-question-id="${question.id}" data-index="${index}"></td>`
    } else {
      html += `<td>${row.value || ""}</td>`
    }

    html += "</tr>"
  })

  html += "</tbody></table></div>"
  return html
}

// Tạo câu hỏi hoàn thành lưu đồ
function createFlowChartQuestion(question) {
  const { content } = question
  let html = `
        <div class="question-content">
            <p>${content.title || "Hoàn thành lưu đồ sau:"}</p>
            <p>${content.instructions || ""}</p>
        </div>
        <div class="flow-chart-container">
    `

  content.items.forEach((item, index) => {
    if (item.isInput) {
      html += `
                <div class="card mb-2">
                    <div class="card-body">
                        <input type="text" class="form-control" id="question_${question.id}_flow_${index}" data-question-id="${question.id}" data-index="${index}">
                    </div>
                </div>
                <div class="text-center mb-2">↓</div>
            `
    } else {
      html += `
                <div class="card mb-2">
                    <div class="card-body">
                        ${item.text || ""}
                    </div>
                </div>
                <div class="text-center mb-2">↓</div>
            `
    }
  })

  // Xóa mũi tên cuối cùng
  html = html.replace(/<div class="text-center mb-2">↓<\/div>$/, "")

  html += "</div>"
  return html
}

// Khởi tạo theo dõi câu trả lời
function initializeAnswerTracking() {
  // Theo dõi radio buttons (câu hỏi một đáp án)
  document.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener("change", function () {
      const questionId = this.dataset.questionId
      studentAnswers[questionId] = this.value
      updateAnsweredCount()
    })
  })

  // Theo dõi checkboxes (câu hỏi nhiều đáp án)
  document.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.addEventListener("change", function () {
      const questionId = this.dataset.questionId
      if (!studentAnswers[questionId]) {
        studentAnswers[questionId] = []
      }

      if (this.checked) {
        if (!studentAnswers[questionId].includes(this.value)) {
          studentAnswers[questionId].push(this.value)
        }
      } else {
        studentAnswers[questionId] = studentAnswers[questionId].filter((value) => value !== this.value)
        if (studentAnswers[questionId].length === 0) {
          delete studentAnswers[questionId]
        }
      }

      updateAnsweredCount()
    })
  })

  // Theo dõi selects (câu hỏi ghép nối)
  document.querySelectorAll("select").forEach((select) => {
    select.addEventListener("change", function () {
      const questionId = this.dataset.questionId
      const index = this.dataset.index

      if (!studentAnswers[questionId]) {
        studentAnswers[questionId] = {}
      }

      if (this.value) {
        studentAnswers[questionId][index] = this.value
      } else {
        delete studentAnswers[questionId][index]
        if (Object.keys(studentAnswers[questionId]).length === 0) {
          delete studentAnswers[questionId]
        }
      }

      updateAnsweredCount()
    })
  })

  // Theo dõi inputs (các loại câu hỏi khác)
  document.querySelectorAll('input[type="text"]').forEach((input) => {
    input.addEventListener("input", function () {
      const questionId = this.dataset.questionId
      const index = this.dataset.index

      if (!studentAnswers[questionId]) {
        studentAnswers[questionId] = {}
      }

      if (this.value.trim()) {
        studentAnswers[questionId][index] = this.value.trim()
      } else {
        delete studentAnswers[questionId][index]
        if (Object.keys(studentAnswers[questionId]).length === 0) {
          delete studentAnswers[questionId]
        }
      }

      updateAnsweredCount()
    })
  })
}

// Cập nhật số câu hỏi đã trả lời
function updateAnsweredCount() {
  const answeredCount = Object.keys(studentAnswers).length
  const totalQuestions = Number.parseInt(document.getElementById("total-questions").textContent)
  const unansweredCount = totalQuestions - answeredCount

  document.getElementById("answered-questions").textContent = answeredCount
  document.getElementById("unanswered-questions").textContent = unansweredCount

  // Cập nhật màu sắc cho các câu hỏi
  document.querySelectorAll(".question-card").forEach((card) => {
    const questionId = card.dataset.questionId
    if (studentAnswers[questionId]) {
      card.classList.add("answered")
      card.classList.remove("unanswered")
    } else {
      card.classList.add("unanswered")
      card.classList.remove("answered")
    }
  })
}

// Nộp bài thi
async function submitTest(testId) {
  // Chuyển đổi dữ liệu câu trả lời thành mảng
  const answers = []
  for (const questionId in studentAnswers) {
    answers.push({
      questionId,
      studentAnswer: studentAnswers[questionId],
    })
  }

  try {
    const response = await fetch(`/api/tests/public/${testId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answers }),
    })

    if (!response.ok) {
      throw new Error("Không thể nộp bài")
    }

    const result = await response.json()
    displayResult(result)
  } catch (error) {
    console.error("Lỗi:", error)
    alert("Lỗi khi nộp bài: " + error.message)
  }
}

// Hiển thị kết quả
function displayResult(result) {
  // Cập nhật thông tin điểm số
  document.getElementById("result-score").textContent = result.score
  document.getElementById("result-details").textContent = `Đúng ${result.correctCount}/${result.totalQuestions} câu hỏi`

  // Hiển thị chi tiết kết quả
  const detailsContainer = document.getElementById("result-details-container")
  detailsContainer.innerHTML = ""

  result.results.forEach((item) => {
    const questionElement = document.querySelector(`.question-card[data-question-id="${item.questionId}"]`)
    if (!questionElement) return

    const questionTitle = questionElement.querySelector(".card-header h3").textContent
    const questionContent = questionElement.querySelector(".question-content").innerHTML

    let answerHtml = ""
    if (item.isCorrect) {
      answerHtml = `
                <div class="alert alert-success">
                    <strong>Đúng!</strong> Câu trả lời của bạn chính xác.
                </div>
            `
    } else {
      answerHtml = `
                <div class="alert alert-danger">
                    <strong>Sai!</strong> Câu trả lời đúng: ${formatCorrectAnswer(item.correctAnswer)}
                </div>
            `
    }

    const resultElement = document.createElement("div")
    resultElement.className = "result-question"
    resultElement.innerHTML = `
            <h4>${questionTitle}</h4>
            ${questionContent}
            <p><strong>Câu trả lời của bạn:</strong> ${formatStudentAnswer(item.studentAnswer)}</p>
            ${answerHtml}
        `

    detailsContainer.appendChild(resultElement)
  })

  // Hiển thị modal kết quả
  const resultModal = new bootstrap.Modal(document.getElementById("result-modal"))
  resultModal.show()
}

// Định dạng câu trả lời của học sinh
function formatStudentAnswer(answer) {
  if (Array.isArray(answer)) {
    return answer.join(", ")
  } else if (typeof answer === "object") {
    return Object.values(answer).join(", ")
  } else {
    return answer
  }
}

// Định dạng đáp án đúng
function formatCorrectAnswer(answer) {
  if (Array.isArray(answer)) {
    return answer.join(", ")
  } else if (typeof answer === "object") {
    return Object.values(answer).join(", ")
  } else {
    return answer
  }
}
