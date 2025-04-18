document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search)
    const testId = urlParams.get("id")
  
    if (!testId) {
      displayError("Không tìm thấy ID bài thi")
      return
    }
  
    fetchTest(testId)
  })
  
  async function fetchTest(testId) {
    try {
      const response = await fetch(`/api/tests/public/${testId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const test = await response.json()
      displayTest(test)
      initializeTestFunctions()
    } catch (error) {
      console.error("Lỗi khi lấy bài thi:", error)
      displayError("Không thể lấy bài thi")
    }
  }
  
  function displayTest(test) {
    document.title = `${test.title} - IELTS Listening Test`
  
    const testContainer = document.getElementById("test-container")
    testContainer.innerHTML = `
      <div class="test-header mb-4">
        <h1>${test.title}</h1>
        <h2 class="text-muted">${test.vietnameseName || ""}</h2>
        <p>${test.description || ""}</p>
      </div>
      
      <div class="test-progress mb-4">
        <div class="progress">
          <div id="progress-bar" class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
        </div>
        <p class="text-center mt-2">
          <span id="answered-count">0</span> / <span id="total-questions">0</span> câu hỏi đã trả lời
        </p>
      </div>
  
      <form id="test-form">
        <div id="test-parts"></div>
        
        <div class="d-grid gap-2 col-md-6 mx-auto mt-4">
          <button type="submit" class="btn btn-primary btn-lg">Nộp bài</button>
        </div>
      </form>
      
      <div id="results-container" class="mt-4" style="display: none;"></div>
    `
  
    const testPartsContainer = document.getElementById("test-parts")
    let totalQuestions = 0
  
    test.parts.forEach((part) => {
      const partElement = document.createElement("div")
      partElement.className = "part mb-4"
      partElement.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h3>Part ${part.part_number}</h3>
            ${
              part.audio_url
                ? `
            <div class="audio-player mb-3">
              <audio controls>
                <source src="${part.audio_url}" type="audio/mpeg">
                Trình duyệt của bạn không hỗ trợ phát audio.
              </audio>
            </div>
            `
                : ""
            }
          </div>
          <div class="card-body">
            <div class="questions-container" id="part-${part.part_number}-questions"></div>
          </div>
        </div>
      `
  
      testPartsContainer.appendChild(partElement)
  
      const questionsContainer = document.getElementById(`part-${part.part_number}-questions`)
      part.questions.forEach((question) => {
        totalQuestions++
        const questionElement = renderQuestion(question, part.part_number)
        questionsContainer.appendChild(questionElement)
      })
    })
  
    document.getElementById("total-questions").textContent = totalQuestions
  }
  
  function renderQuestion(question, partNumber) {
    const questionElement = document.createElement("div")
    questionElement.className = "question mb-4"
    questionElement.dataset.id = question.id
    questionElement.dataset.type = question.question_type
  
    let questionContent = ""
  
    switch (question.question_type) {
      case "multiple-choice-single":
        questionContent = renderMultipleChoiceSingle(question)
        break
      case "multiple-choice-multiple":
        questionContent = renderMultipleChoiceMultiple(question)
        break
      case "matching":
        questionContent = renderMatching(question)
        break
      case "plan-map-diagram-labelling":
        questionContent = renderPlanMapDiagram(question)
        break
      case "note-completion":
        questionContent = renderNoteCompletion(question)
        break
      case "form-completion":
        questionContent = renderFormCompletion(question)
        break
      case "flow-chart-completion":
        questionContent = renderFlowChartCompletion(question)
        break
      default:
        questionContent = `<p class="text-danger">Loại câu hỏi không được hỗ trợ: ${question.question_type}</p>`
    }
  
    questionElement.innerHTML = `
      <div class="card question-card" data-answered="false">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Câu hỏi ${partNumber}.${question.id}</span>
          <span class="badge bg-warning">Chưa trả lời</span>
        </div>
        <div class="card-body">
          ${questionContent}
        </div>
      </div>
    `
  
    return questionElement
  }
  
  function renderMultipleChoiceSingle(question) {
    const { content } = question
    const options = content.options || []
  
    return `
      <p class="question-text">${content.question || ""}</p>
      <div class="options">
        ${options
          .map(
            (option, index) => `
          <div class="form-check">
            <input class="form-check-input" type="radio" name="question-${question.id}" id="question-${question.id}-option-${index}" value="${option}">
            <label class="form-check-label" for="question-${question.id}-option-${index}">
              ${option}
            </label>
          </div>
        `,
          )
          .join("")}
      </div>
    `
  }
  
  function renderMultipleChoiceMultiple(question) {
    const { content } = question
    const options = content.options || []
  
    return `
      <p class="question-text">${content.question || ""}</p>
      <div class="options">
        ${options
          .map(
            (option, index) => `
          <div class="form-check">
            <input class="form-check-input" type="checkbox" name="question-${question.id}" id="question-${
              question.id
            }-option-${index}" value="${option}">
            <label class="form-check-label" for="question-${question.id}-option-${index}">
              ${option}
            </label>
          </div>
        `,
          )
          .join("")}
      </div>
    `
  }
  
  function renderMatching(question) {
    const { content } = question
    const questions = content.questions || []
    const options = content.options || []
  
    return `
      <p class="question-text">${content.title || ""}</p>
      <div class="matching-container">
        ${questions
          .map(
            (q, index) => `
          <div class="matching-item mb-3">
            <div class="row align-items-center">
              <div class="col-md-6">
                <p>${q}</p>
              </div>
              <div class="col-md-6">
                <select class="form-select" name="question-${question.id}-match-${index}" data-index="${index}">
                  <option value="">-- Chọn --</option>
                  ${options.map((option) => `<option value="${option}">${option}</option>`).join("")}
                </select>
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `
  }
  
  function renderPlanMapDiagram(question) {
    const { content } = question
    const labels = content.labels || []
  
    return `
      <div class="plan-map-container">
        <p class="question-text">${content.instructions || ""}</p>
        ${
          content.imageUrl
            ? `<div class="map-image-container mb-3">
                 <img src="${content.imageUrl}" alt="Map/Diagram" class="img-fluid">
               </div>`
            : ""
        }
        <div class="labels-container">
          ${labels
            .map(
              (label, index) => `
            <div class="mb-3">
              <label class="form-label">${index + 1}. ${label.text || ""}</label>
              <input type="text" class="form-control" name="question-${question.id}-label-${index}" placeholder="Nhập câu trả lời">
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `
  }
  
  function renderNoteCompletion(question) {
    const { content } = question
    const notes = content.notes || []
  
    return `
      <div class="note-completion-container">
        <p class="question-text">${content.instructions || ""}</p>
        <h5>${content.title || ""}</h5>
        <div class="notes-container">
          ${notes
            .map(
              (note, index) => `
            <div class="note-item mb-2">
              ${note.text.replace(/\{(\d+)\}/g, (match, number) => {
                return `<input type="text" class="form-control d-inline-block mx-1" style="width: 150px;" name="question-${question.id}-note-${number}" placeholder="Câu trả lời ${number}">`
              })}
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `
  }
  
  function renderFormCompletion(question) {
    const { content } = question
    const formItems = content.formItems || []
  
    return `
      <div class="form-completion-container">
        <p class="question-text">${content.instructions || ""}</p>
        <table class="table table-bordered">
          <tbody>
            ${formItems
              .map(
                (item, index) => `
            <tr>
              <td width="30%">${item.label}</td>
              <td>
                <input type="text" class="form-control" name="question-${question.id}-form-${index}" placeholder="Nhập câu trả lời">
              </td>
            </tr>
          `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `
  }
  
  function renderFlowChartCompletion(question) {
    const { content } = question
    const flowItems = content.flowItems || []
  
    return `
      <div class="flow-chart-container">
        <p class="question-text">${content.instructions || ""}</p>
        <h5>${content.title || ""}</h5>
        <div class="flow-items-container">
          ${flowItems
            .map(
              (item, index) => `
            <div class="flow-item card mb-3">
              <div class="card-body">
                <p>${item.text.replace(/\{(\d+)\}/g, (match, number) => {
                  return `<input type="text" class="form-control d-inline-block mx-1" style="width: 150px;" name="question-${question.id}-flow-${number}" placeholder="Câu trả lời ${number}">`
                })}</p>
              </div>
            </div>
            ${index < flowItems.length - 1 ? '<div class="flow-arrow text-center mb-2">↓</div>' : ""}
          `,
            )
            .join("")}
        </div>
      </div>
    `
  }
  
  function initializeTestFunctions() {
    const testForm = document.getElementById("test-form")
    const inputs = testForm.querySelectorAll("input, select")
    const totalQuestions = document.querySelectorAll(".question").length
    let answeredQuestions = 0
  
    // Theo dõi câu trả lời
    inputs.forEach((input) => {
      input.addEventListener("change", function () {
        const questionCard = this.closest(".question-card")
        const question = this.closest(".question")
        const questionType = question.dataset.type
        const questionId = question.dataset.id
  
        // Kiểm tra xem câu hỏi đã được trả lời đầy đủ chưa
        let isAnswered = false
  
        if (questionType === "multiple-choice-single") {
          isAnswered = question.querySelector('input[type="radio"]:checked') !== null
        } else if (questionType === "multiple-choice-multiple") {
          isAnswered = question.querySelectorAll('input[type="checkbox"]:checked').length > 0
        } else if (questionType === "matching") {
          const selects = question.querySelectorAll("select")
          isAnswered = Array.from(selects).every((select) => select.value !== "")
        } else if (
          questionType === "plan-map-diagram-labelling" ||
          questionType === "note-completion" ||
          questionType === "form-completion" ||
          questionType === "flow-chart-completion"
        ) {
          const textInputs = question.querySelectorAll('input[type="text"]')
          isAnswered = Array.from(textInputs).some((input) => input.value.trim() !== "")
        }
  
        // Cập nhật trạng thái câu hỏi
        if (isAnswered) {
          if (questionCard.dataset.answered === "false") {
            questionCard.dataset.answered = "true"
            questionCard.querySelector(".badge").className = "badge bg-success"
            questionCard.querySelector(".badge").textContent = "Đã trả lời"
            answeredQuestions++
          }
        } else {
          if (questionCard.dataset.answered === "true") {
            questionCard.dataset.answered = "false"
            questionCard.querySelector(".badge").className = "badge bg-warning"
            questionCard.querySelector(".badge").textContent = "Chưa trả lời"
            answeredQuestions--
          }
        }
  
        // Cập nhật thanh tiến trình
        updateProgress(answeredQuestions, totalQuestions)
      })
    })
  
    // Xử lý nộp bài
    testForm.addEventListener("submit", async (e) => {
      e.preventDefault()
  
      if (!confirm("Bạn có chắc chắn muốn nộp bài?")) {
        return
      }
  
      const testId = new URLSearchParams(window.location.search).get("id")
      const answers = []
  
      // Thu thập câu trả lời
      document.querySelectorAll(".question").forEach((question) => {
        const questionId = question.dataset.id
        const questionType = question.dataset.type
        let studentAnswer = null
  
        if (questionType === "multiple-choice-single") {
          const selectedOption = question.querySelector('input[type="radio"]:checked')
          if (selectedOption) {
            studentAnswer = selectedOption.value
          }
        } else if (questionType === "multiple-choice-multiple") {
          const selectedOptions = question.querySelectorAll('input[type="checkbox"]:checked')
          if (selectedOptions.length > 0) {
            studentAnswer = Array.from(selectedOptions).map((option) => option.value)
          }
        } else if (questionType === "matching") {
          const selects = question.querySelectorAll("select")
          if (selects.length > 0) {
            studentAnswer = Array.from(selects).map((select) => select.value)
          }
        } else if (questionType === "plan-map-diagram-labelling") {
          const inputs = question.querySelectorAll('input[type="text"]')
          if (inputs.length > 0) {
            studentAnswer = Array.from(inputs).map((input) => input.value.trim())
          }
        } else if (questionType === "note-completion") {
          const inputs = question.querySelectorAll('input[type="text"]')
          if (inputs.length > 0) {
            studentAnswer = {}
            inputs.forEach((input) => {
              const noteNumber = input.name.split("-").pop()
              studentAnswer[noteNumber] = input.value.trim()
            })
          }
        } else if (questionType === "form-completion") {
          const inputs = question.querySelectorAll('input[type="text"]')
          if (inputs.length > 0) {
            studentAnswer = Array.from(inputs).map((input) => input.value.trim())
          }
        } else if (questionType === "flow-chart-completion") {
          const inputs = question.querySelectorAll('input[type="text"]')
          if (inputs.length > 0) {
            studentAnswer = {}
            inputs.forEach((input) => {
              const flowNumber = input.name.split("-").pop()
              studentAnswer[flowNumber] = input.value.trim()
            })
          }
        }
  
        if (studentAnswer !== null) {
          answers.push({
            questionId,
            studentAnswer,
          })
        }
      })
  
      try {
        const response = await fetch(`/api/tests/public/${testId}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers,
            studentName: "Anonymous",
          }),
        })
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
  
        const result = await response.json()
        displayResults(result)
      } catch (error) {
        console.error("Lỗi khi nộp bài:", error)
        alert("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.")
      }
    })
  }
  
  function updateProgress(answered, total) {
    const progressBar = document.getElementById("progress-bar")
    const answeredCount = document.getElementById("answered-count")
    const percentage = Math.round((answered / total) * 100)
  
    progressBar.style.width = `${percentage}%`
    progressBar.setAttribute("aria-valuenow", percentage)
    progressBar.textContent = `${percentage}%`
    answeredCount.textContent = answered
  }
  
  function displayResults(result) {
    const testForm = document.getElementById("test-form")
    const resultsContainer = document.getElementById("results-container")
  
    // Ẩn form làm bài
    testForm.style.display = "none"
  
    // Hiển thị kết quả
    resultsContainer.style.display = "block"
    resultsContainer.innerHTML = `
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h3>Kết quả bài thi</h3>
        </div>
        <div class="card-body">
          <div class="text-center mb-4">
            <h4>Điểm số của bạn</h4>
            <div class="display-1 fw-bold">${result.score}%</div>
            <p class="lead">Số câu đúng: ${result.correctCount}/${result.totalQuestions}</p>
          </div>
          
          <div class="d-grid gap-2 col-md-6 mx-auto mt-4">
            <a href="index.html" class="btn btn-primary">Quay lại danh sách bài thi</a>
          </div>
        </div>
      </div>
    `
  }
  
  function displayError(message) {
    const testContainer = document.getElementById("test-container")
    testContainer.innerHTML = `
      <div class="alert alert-danger">
        <h4>Lỗi!</h4>
        <p>${message}</p>
      </div>
      <div class="text-center">
        <a href="index.html" class="btn btn-primary">Quay lại danh sách bài thi</a>
      </div>
    `
  }
  