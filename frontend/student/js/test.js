document.addEventListener("DOMContentLoaded", () => {
    // Lấy ID bài thi từ URL
    const urlParams = new URLSearchParams(window.location.search)
    const testId = urlParams.get("id")
  
    if (!testId) {
      showError("Không tìm thấy ID bài thi trong URL")
      return
    }
  
    // Lấy thông tin bài thi
    fetchTest(testId)
  })
  
  // Lấy thông tin bài thi từ API
  async function fetchTest(testId) {
    try {
      // Sửa đường dẫn API để phù hợp với cấu trúc server
      const response = await fetch(`/tests/public/${testId}`)
      if (!response.ok) {
        throw new Error("Không thể lấy thông tin bài thi")
      }
  
      const test = await response.json()
      displayTest(test)
    } catch (error) {
      console.error("Lỗi:", error)
      showError(`Không thể tải bài thi. Chi tiết lỗi: ${error.message}`)
    }
  }
  
  // Hiển thị lỗi
  function showError(message) {
    document.getElementById("test-container").innerHTML = `
          <div class="alert alert-danger" role="alert">
              <h4 class="alert-heading">Lỗi!</h4>
              <p>${message}</p>
              <hr>
              <p class="mb-0">
                  <a href="index.html" class="btn btn-primary">Quay lại danh sách bài thi</a>
              </p>
          </div>
      `
  }
  
  // Hiển thị bài thi
  function displayTest(test) {
    document.getElementById("test-title").textContent = test.title
    document.getElementById("test-description").textContent = test.description || "Không có mô tả"
  
    const container = document.getElementById("test-container")
    container.innerHTML = ""
  
    // Tạo form để nộp bài
    const form = document.createElement("form")
    form.id = "test-form"
    form.className = "mb-4"
  
    // Biến để theo dõi tổng số câu hỏi và số câu đã trả lời
    let totalQuestions = 0
    let answeredQuestions = 0
  
    // Hiển thị các phần và câu hỏi
    test.parts.forEach((part, partIndex) => {
      const partDiv = document.createElement("div")
      partDiv.className = "card mb-4"
  
      const partHeader = document.createElement("div")
      partHeader.className = "card-header d-flex justify-content-between align-items-center"
      partHeader.innerHTML = `
              <h5 class="mb-0">Phần ${part.part_number}</h5>
              ${
                part.audio_url
                  ? `<audio controls>
                      <source src="${part.audio_url}" type="audio/mpeg">
                      Trình duyệt của bạn không hỗ trợ phát audio.
                  </audio>`
                  : ""
              }
          `
  
      const partBody = document.createElement("div")
      partBody.className = "card-body"
  
      // Hiển thị các câu hỏi
      part.questions.forEach((question, questionIndex) => {
        totalQuestions++
        const questionDiv = document.createElement("div")
        questionDiv.className = "question-container mb-4 p-3 border rounded"
        questionDiv.dataset.questionId = question.id
        questionDiv.dataset.questionType = question.question_type
  
        // Hiển thị câu hỏi dựa trên loại
        switch (question.question_type) {
          case "single_choice":
            renderSingleChoiceQuestion(questionDiv, question, partIndex, questionIndex)
            break
          case "multiple_choice":
            renderMultipleChoiceQuestion(questionDiv, question, partIndex, questionIndex)
            break
          case "matching":
            renderMatchingQuestion(questionDiv, question, partIndex, questionIndex)
            break
          case "map_labeling":
            renderMapLabelingQuestion(questionDiv, question, partIndex, questionIndex)
            break
          case "note_completion":
            renderNoteCompletionQuestion(questionDiv, question, partIndex, questionIndex)
            break
          case "form_completion":
            renderFormCompletionQuestion(questionDiv, question, partIndex, questionIndex)
            break
          case "flow_chart":
            renderFlowChartQuestion(questionDiv, question, partIndex, questionIndex)
            break
          default:
            questionDiv.innerHTML = `<p class="text-danger">Loại câu hỏi không được hỗ trợ: ${question.question_type}</p>`
        }
  
        partBody.appendChild(questionDiv)
      })
  
      partDiv.appendChild(partHeader)
      partDiv.appendChild(partBody)
      form.appendChild(partDiv)
    })
  
    // Thêm nút nộp bài
    const submitButton = document.createElement("button")
    submitButton.type = "button"
    submitButton.className = "btn btn-primary btn-lg"
    submitButton.textContent = "Nộp bài"
    submitButton.addEventListener("click", () => submitTest(test.id))
    form.appendChild(submitButton)
  
    // Thêm phần hiển thị số câu đã trả lời
    const progressDiv = document.createElement("div")
    progressDiv.className = "mt-3"
    progressDiv.innerHTML = `
          <div class="progress mb-2">
              <div id="progress-bar" class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
          </div>
          <p id="progress-text">Đã trả lời: <span id="answered-count">0</span>/${totalQuestions} câu hỏi</p>
      `
    form.appendChild(progressDiv)
  
    container.appendChild(form)
  
    // Thêm sự kiện để theo dõi câu trả lời
    document.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("change", () => {
        updateProgress()
      })
    })
  
    // Hàm cập nhật tiến độ
    function updateProgress() {
      const questions = document.querySelectorAll(".question-container")
      answeredQuestions = 0
  
      questions.forEach((questionDiv) => {
        const questionType = questionDiv.dataset.questionType
        let answered = false
  
        switch (questionType) {
          case "single_choice":
            answered = questionDiv.querySelector("input:checked") !== null
            break
          case "multiple_choice":
            answered = questionDiv.querySelector("input:checked") !== null
            break
          case "matching":
            const selects = questionDiv.querySelectorAll("select")
            answered = Array.from(selects).every((select) => select.value !== "")
            break
          case "map_labeling":
          case "note_completion":
          case "form_completion":
          case "flow_chart":
            const inputs = questionDiv.querySelectorAll("input[type='text']")
            answered = Array.from(inputs).every((input) => input.value.trim() !== "")
            break
        }
  
        if (answered) {
          questionDiv.classList.add("border-success")
          questionDiv.classList.remove("border-danger")
          answeredQuestions++
        } else {
          questionDiv.classList.add("border-danger")
          questionDiv.classList.remove("border-success")
        }
      })
  
      const percentage = Math.round((answeredQuestions / totalQuestions) * 100)
      document.getElementById("progress-bar").style.width = `${percentage}%`
      document.getElementById("progress-bar").textContent = `${percentage}%`
      document.getElementById("progress-bar").setAttribute("aria-valuenow", percentage)
      document.getElementById("answered-count").textContent = answeredQuestions
    }
  }
  
  // Hiển thị câu hỏi một đáp án
  function renderSingleChoiceQuestion(container, question, partIndex, questionIndex) {
    const content = question.content
    container.innerHTML = `
          <h5 class="mb-3">Câu hỏi ${partIndex + 1}.${questionIndex + 1}: ${content.question || ""}</h5>
          <div class="options">
              ${content.options
                .map(
                  (option, index) => `
                  <div class="form-check">
                      <input class="form-check-input" type="radio" name="question_${question.id}" id="question_${
                        question.id
                      }_option_${index}" value="${option}">
                      <label class="form-check-label" for="question_${question.id}_option_${index}">
                          ${option}
                      </label>
                  </div>
              `,
                )
                .join("")}
          </div>
      `
  }
  
  // Hiển thị câu hỏi nhiều đáp án
  function renderMultipleChoiceQuestion(container, question, partIndex, questionIndex) {
    const content = question.content
    container.innerHTML = `
          <h5 class="mb-3">Câu hỏi ${partIndex + 1}.${questionIndex + 1}: ${content.question || ""}</h5>
          <div class="options">
              ${content.options
                .map(
                  (option, index) => `
                  <div class="form-check">
                      <input class="form-check-input" type="checkbox" name="question_${question.id}" id="question_${
                        question.id
                      }_option_${index}" value="${option}">
                      <label class="form-check-label" for="question_${question.id}_option_${index}">
                          ${option}
                      </label>
                  </div>
              `,
                )
                .join("")}
          </div>
      `
  }
  
  // Hiển thị câu hỏi ghép nối
  function renderMatchingQuestion(container, question, partIndex, questionIndex) {
    const content = question.content
    container.innerHTML = `
          <h5 class="mb-3">Câu hỏi ${partIndex + 1}.${questionIndex + 1}: ${content.title || ""}</h5>
          <table class="table">
              <thead>
                  <tr>
                      <th>Câu hỏi</th>
                      <th>Đáp án</th>
                  </tr>
              </thead>
              <tbody>
                  ${content.questions
                    .map(
                      (q, index) => `
                      <tr>
                          <td>${q}</td>
                          <td>
                              <select class="form-select" name="question_${question.id}_match_${index}" data-index="${index}">
                                  <option value="">-- Chọn đáp án --</option>
                                  ${content.options
                                    .map(
                                      (option) => `
                                      <option value="${option}">${option}</option>
                                  `,
                                    )
                                    .join("")}
                              </select>
                          </td>
                      </tr>
                  `,
                    )
                    .join("")}
              </tbody>
          </table>
      `
  }
  
  // Hiển thị câu hỏi ghi nhãn bản đồ
  function renderMapLabelingQuestion(container, question, partIndex, questionIndex) {
    const content = question.content
    container.innerHTML = `
          <h5 class="mb-3">Câu hỏi ${partIndex + 1}.${questionIndex + 1}: ${content.type || ""}</h5>
          <p class="mb-3">${content.instructions || ""}</p>
          ${
            content.imageUrl
              ? `<div class="mb-3">
                  <img src="${content.imageUrl}" alt="Map/Diagram" class="img-fluid border">
              </div>`
              : ""
          }
          <div class="labels">
              ${content.labels
                .map(
                  (label, index) => `
                  <div class="mb-2">
                      <label class="form-label">${label}:</label>
                      <input type="text" class="form-control" name="question_${question.id}_label_${index}" placeholder="Nhập đáp án">
                  </div>
              `,
                )
                .join("")}
          </div>
      `
  }
  
  // Hiển thị câu hỏi hoàn thành ghi chú
  function renderNoteCompletionQuestion(container, question, partIndex, questionIndex) {
    const content = question.content
    container.innerHTML = `
          <h5 class="mb-3">Câu hỏi ${partIndex + 1}.${questionIndex + 1}: Hoàn thành ghi chú</h5>
          <p class="mb-3">${content.instructions || ""}</p>
          <h6 class="mb-2">${content.topic || ""}</h6>
          <div class="notes">
              ${content.notes
                .map((note, index) => {
                  // Thay thế các khoảng trống bằng input
                  let noteHtml = note
                  const blanks = note.match(/\[(\d+)\]/g) || []
                  blanks.forEach((blank) => {
                    const blankIndex = blank.match(/\[(\d+)\]/)[1]
                    noteHtml = noteHtml.replace(
                      blank,
                      `<input type="text" class="form-control d-inline-block" style="width: 150px;" name="question_${question.id}_blank_${blankIndex}" placeholder="Đáp án ${blankIndex}">`,
                    )
                  })
                  return `<p class="mb-2">${noteHtml}</p>`
                })
                .join("")}
          </div>
      `
  }
  
  // Hiển thị câu hỏi hoàn thành biểu mẫu
  function renderFormCompletionQuestion(container, question, partIndex, questionIndex) {
    const content = question.content
    container.innerHTML = `
          <h5 class="mb-3">Câu hỏi ${partIndex + 1}.${questionIndex + 1}: Hoàn thành biểu mẫu</h5>
          <p class="mb-3">${content.instructions || ""}</p>
          <table class="table table-bordered">
              ${content.rows
                .map((row) => {
                  let rowHtml = "<tr>"
                  row.forEach((cell, cellIndex) => {
                    if (cell.startsWith("[") && cell.endsWith("]")) {
                      // Đây là ô cần điền
                      const blankIndex = cell.match(/\[(\d+)\]/)[1]
                      rowHtml += `<td><input type="text" class="form-control" name="question_${question.id}_blank_${blankIndex}" placeholder="Đáp án ${blankIndex}"></td>`
                    } else {
                      rowHtml += `<td>${cell}</td>`
                    }
                  })
                  rowHtml += "</tr>"
                  return rowHtml
                })
                .join("")}
          </table>
      `
  }
  
  // Hiển thị câu hỏi hoàn thành lưu đồ
  function renderFlowChartQuestion(container, question, partIndex, questionIndex) {
    const content = question.content
    container.innerHTML = `
          <h5 class="mb-3">Câu hỏi ${partIndex + 1}.${questionIndex + 1}: ${content.title || ""}</h5>
          <p class="mb-3">${content.instructions || ""}</p>
          <div class="flow-chart">
              ${content.items
                .map((item, index) => {
                  if (item.isBlank) {
                    return `
                          <div class="card mb-2">
                              <div class="card-body">
                                  <input type="text" class="form-control" name="question_${question.id}_blank_${index}" placeholder="Đáp án ${
                                    index + 1
                                  }">
                              </div>
                          </div>
                          <div class="text-center mb-2">↓</div>
                      `
                  } else {
                    return `
                          <div class="card mb-2">
                              <div class="card-body">
                                  ${item.text}
                              </div>
                          </div>
                          ${index < content.items.length - 1 ? '<div class="text-center mb-2">↓</div>' : ""}
                      `
                  }
                })
                .join("")}
          </div>
      `
  }
  
  // Nộp bài thi
  async function submitTest(testId) {
    try {
      // Kiểm tra xem đã trả lời hết câu hỏi chưa
      const questions = document.querySelectorAll(".question-container")
      const unansweredQuestions = []
  
      questions.forEach((questionDiv, index) => {
        const questionType = questionDiv.dataset.questionType
        const questionId = questionDiv.dataset.questionId
        let answered = false
  
        switch (questionType) {
          case "single_choice":
            answered = questionDiv.querySelector("input:checked") !== null
            break
          case "multiple_choice":
            answered = questionDiv.querySelector("input:checked") !== null
            break
          case "matching":
            const selects = questionDiv.querySelectorAll("select")
            answered = Array.from(selects).every((select) => select.value !== "")
            break
          case "map_labeling":
          case "note_completion":
          case "form_completion":
          case "flow_chart":
            const inputs = questionDiv.querySelectorAll("input[type='text']")
            answered = Array.from(inputs).every((input) => input.value.trim() !== "")
            break
        }
  
        if (!answered) {
          unansweredQuestions.push(index + 1)
        }
      })
  
      if (unansweredQuestions.length > 0) {
        if (
          !confirm(
            `Bạn chưa trả lời ${unansweredQuestions.length} câu hỏi (câu ${unansweredQuestions.join(
              ", ",
            )}). Bạn có chắc chắn muốn nộp bài không?`,
          )
        ) {
          return
        }
      }
  
      // Thu thập câu trả lời
      const answers = []
      questions.forEach((questionDiv) => {
        const questionType = questionDiv.dataset.questionType
        const questionId = questionDiv.dataset.questionId
        let studentAnswer = null
  
        switch (questionType) {
          case "single_choice":
            const checkedRadio = questionDiv.querySelector("input:checked")
            if (checkedRadio) {
              studentAnswer = checkedRadio.value
            }
            break
          case "multiple_choice":
            const checkedBoxes = questionDiv.querySelectorAll("input:checked")
            if (checkedBoxes.length > 0) {
              studentAnswer = Array.from(checkedBoxes).map((checkbox) => checkbox.value)
            }
            break
          case "matching":
            const selects = questionDiv.querySelectorAll("select")
            if (selects.length > 0) {
              studentAnswer = Array.from(selects).map((select) => ({
                index: select.dataset.index,
                value: select.value,
              }))
            }
            break
          case "map_labeling":
          case "note_completion":
          case "form_completion":
          case "flow_chart":
            const inputs = questionDiv.querySelectorAll("input[type='text']")
            if (inputs.length > 0) {
              studentAnswer = {}
              inputs.forEach((input) => {
                const name = input.name
                const match = name.match(/blank_(\d+)/)
                if (match) {
                  const index = match[1]
                  studentAnswer[index] = input.value.trim()
                }
              })
            }
            break
        }
  
        if (studentAnswer !== null) {
          answers.push({
            questionId,
            studentAnswer,
          })
        }
      })
  
      // Gửi câu trả lời lên server
      const response = await fetch(`/tests/public/${testId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          studentName: prompt("Vui lòng nhập tên của bạn:", "Học sinh") || "Học sinh",
        }),
      })
  
      if (!response.ok) {
        throw new Error("Không thể nộp bài")
      }
  
      const result = await response.json()
      displayResult(result)
    } catch (error) {
      console.error("Lỗi:", error)
      alert(`Lỗi khi nộp bài: ${error.message}`)
    }
  }
  
  // Hiển thị kết quả
  function displayResult(result) {
    const container = document.getElementById("test-container")
    container.innerHTML = `
          <div class="card mb-4">
              <div class="card-header bg-primary text-white">
                  <h4 class="mb-0">Kết quả bài thi</h4>
              </div>
              <div class="card-body">
                  <h5 class="mb-3">Điểm số: ${result.score}/100</h5>
                  <p>Số câu đúng: ${result.correctCount}/${result.totalQuestions}</p>
                  
                  <div class="progress mb-4">
                      <div class="progress-bar" role="progressbar" style="width: ${result.score}%;" aria-valuenow="${
                        result.score
                      }" aria-valuemin="0" aria-valuemax="100">${result.score}%</div>
                  </div>
                  
                  <h5 class="mb-3">Chi tiết kết quả:</h5>
                  <div class="table-responsive">
                      <table class="table table-bordered">
                          <thead>
                              <tr>
                                  <th>Câu hỏi</th>
                                  <th>Kết quả</th>
                                  <th>Đáp án của bạn</th>
                                  <th>Đáp án đúng</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${result.results
                                .map(
                                  (item) => `
                                  <tr class="${item.isCorrect ? "table-success" : "table-danger"}">
                                      <td>${item.questionId}</td>
                                      <td>${item.isCorrect ? "Đúng" : "Sai"}</td>
                                      <td>${formatAnswer(item.studentAnswer)}</td>
                                      <td>${formatAnswer(item.correctAnswer)}</td>
                                  </tr>
                              `,
                                )
                                .join("")}
                          </tbody>
                      </table>
                  </div>
                  
                  <div class="mt-4">
                      <a href="index.html" class="btn btn-primary">Quay lại danh sách bài thi</a>
                  </div>
              </div>
          </div>
      `
  }
  
  // Định dạng câu trả lời để hiển thị
  function formatAnswer(answer) {
    if (answer === null || answer === undefined) {
      return "Không có câu trả lời"
    }
  
    if (Array.isArray(answer)) {
      return answer.join(", ")
    }
  
    if (typeof answer === "object") {
      return Object.entries(answer)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")
    }
  
    return answer.toString()
  }
  