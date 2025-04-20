document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search)
    const testId = urlParams.get("id")
  
    if (!testId) {
      displayError("Không tìm thấy ID bài kiểm tra")
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
      setupSubmitForm(test)
    } catch (error) {
      console.error("Lỗi:", error)
      displayError("Không thể lấy thông tin bài kiểm tra")
    }
  }
  
  function displayTest(test) {
    document.getElementById("test-title").textContent = test.title
    document.getElementById("test-vietnamese-name").textContent = test.vietnameseName || ""
    document.getElementById("test-description").textContent = test.description || "Không có mô tả"
  
    const questionsContainer = document.getElementById("questions-container")
    questionsContainer.innerHTML = ""
  
    let questionNumber = 1
    test.parts.forEach((part, partIndex) => {
      const partElement = document.createElement("div")
      partElement.className = "card mb-4"
      partElement.innerHTML = `
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Phần ${part.part_number}</h5>
        </div>
        <div class="card-body">
          ${
            part.audio_url
              ? `
            <div class="mb-3">
              <audio controls class="w-100">
                <source src="${part.audio_url}" type="audio/mpeg">
                Trình duyệt của bạn không hỗ trợ phát audio.
              </audio>
            </div>
          `
              : ""
          }
          <div id="part-${part.id}-questions"></div>
        </div>
      `
      questionsContainer.appendChild(partElement)
  
      const partQuestionsContainer = document.getElementById(`part-${part.id}-questions`)
      part.questions.forEach((question, questionIndex) => {
        const questionElement = document.createElement("div")
        questionElement.className = "card mb-3"
        questionElement.innerHTML = `
          <div class="card-body">
            <h6 class="card-title">Câu hỏi ${questionNumber}</h6>
            <div id="question-${question.id}-content"></div>
          </div>
        `
        partQuestionsContainer.appendChild(questionElement)
  
        const questionContentContainer = document.getElementById(`question-${question.id}-content`)
        renderQuestion(question, questionContentContainer)
  
        questionNumber++
      })
    })
  }
  
  function renderQuestion(question, container) {
    switch (question.question_type) {
      case "multiple-choice-single":
        renderMultipleChoiceSingle(question, container)
        break
      case "multiple-choice-multiple":
        renderMultipleChoiceMultiple(question, container)
        break
      case "matching":
        renderMatching(question, container)
        break
      case "plan-map-diagram":
        renderPlanMapDiagram(question, container)
        break
      case "note-completion":
        renderNoteCompletion(question, container)
        break
      case "form-completion":
        renderFormCompletion(question, container)
        break
      case "flow-chart":
        renderFlowChart(question, container)
        break
      default:
        container.innerHTML = `<p class="text-danger">Loại câu hỏi không được hỗ trợ: ${question.question_type}</p>`
    }
  }
  
  function renderMultipleChoiceSingle(question, container) {
    const content = question.content
    container.innerHTML = `
      <p class="mb-3">${content.question}</p>
      <div class="options-container">
        ${content.options
          .map(
            (option, index) => `
          <div class="form-check mb-2">
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
  
  function renderMultipleChoiceMultiple(question, container) {
    const content = question.content
    container.innerHTML = `
      <p class="mb-3">${content.question}</p>
      <div class="options-container">
        ${content.options
          .map(
            (option, index) => `
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" name="question-${question.id}" id="question-${question.id}-option-${index}" value="${option}">
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
  
  function renderMatching(question, container) {
    const content = question.content
    container.innerHTML = `
      <p class="mb-3">${content.title}</p>
      <div class="matching-container">
        ${content.questions
          .map(
            (item, index) => `
          <div class="mb-3">
            <label class="form-label">${item}</label>
            <select class="form-select" name="question-${question.id}-match-${index}" data-index="${index}">
              <option value="">-- Chọn --</option>
              ${content.options.map((option) => `<option value="${option}">${option}</option>`).join("")}
            </select>
          </div>
        `,
          )
          .join("")}
      </div>
    `
  }
  
  function renderPlanMapDiagram(question, container) {
    const content = question.content
    container.innerHTML = `
      <p class="mb-3">${content.instructions}</p>
      <div class="map-container position-relative mb-3">
        <img src="${content.imageUrl}" class="img-fluid" alt="Map/Diagram">
        ${content.labels
          .map(
            (label) => `
          <div class="position-absolute" style="left: ${label.x}px; top: ${label.y}px;">
            <span class="badge bg-primary">${label.id}</span>
          </div>
        `,
          )
          .join("")}
      </div>
      <div class="labels-container">
        ${content.labels
          .map(
            (label) => `
          <div class="mb-3">
            <label class="form-label">Label ${label.id}</label>
            <select class="form-select" name="question-${question.id}-label-${label.id}">
              <option value="">-- Chọn --</option>
              ${content.options.map((option) => `<option value="${option}">${option}</option>`).join("")}
            </select>
          </div>
        `,
          )
          .join("")}
      </div>
    `
  }
  
  function renderNoteCompletion(question, container) {
    const content = question.content
    container.innerHTML = `
      <p class="mb-3">${content.instructions}</p>
      <h6 class="mb-3">${content.topic}</h6>
      <div class="notes-container">
        ${content.notes
          .map((note, index) => {
            const parts = note.split("_____")
            return `
            <div class="mb-3">
              <p>${parts[0]}<input type="text" class="form-control d-inline-block mx-2" style="width: 150px;" name="question-${question.id}-note-${index}">${parts[1] || ""}</p>
            </div>
          `
          })
          .join("")}
      </div>
    `
  }
  
  function renderFormCompletion(question, container) {
    const content = question.content
    container.innerHTML = `
      <p class="mb-3">${content.instructions}</p>
      <div class="form-container">
        <table class="table">
          <tbody>
            ${content.rows
              .map(
                (row, index) => `
              <tr>
                <td>${row.label}</td>
                <td><input type="text" class="form-control" name="question-${question.id}-form-${index}"></td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `
  }
  
  function renderFlowChart(question, container) {
    const content = question.content
    container.innerHTML = `
      <p class="mb-3">${content.title}</p>
      <p class="mb-3">${content.instructions}</p>
      <div class="flow-chart-container">
        ${content.items
          .map((item, index) => {
            const parts = item.split("_____")
            return `
            <div class="card mb-2">
              <div class="card-body">
                ${parts[0]}
                <select class="form-select d-inline-block mx-2" style="width: auto;" name="question-${question.id}-flow-${index}">
                  <option value="">-- Chọn --</option>
                  ${content.options.map((option) => `<option value="${option}">${option}</option>`).join("")}
                </select>
                ${parts[1] || ""}
              </div>
            </div>
            ${index < content.items.length - 1 ? '<div class="text-center mb-2"><i class="bi bi-arrow-down"></i></div>' : ""}
          `
          })
          .join("")}
      </div>
    `
  }
  
  function setupSubmitForm(test) {
    const submitButton = document.getElementById("submit-test")
    submitButton.addEventListener("click", () => {
      submitTest(test.id)
    })
  }
  
  async function submitTest(testId) {
    const answers = []
    const allInputs = document.querySelectorAll(
      'input[type="radio"]:checked, input[type="checkbox"]:checked, input[type="text"], select',
    )
  
    const questionAnswers = {}
  
    allInputs.forEach((input) => {
      const name = input.getAttribute("name")
      if (!name) return
  
      if (name.includes("question-")) {
        const parts = name.split("-")
        const questionId = parts[1]
  
        if (!questionAnswers[questionId]) {
          questionAnswers[questionId] = {
            questionId,
            studentAnswer: null,
          }
        }
  
        if (
          name.includes("-match-") ||
          name.includes("-label-") ||
          name.includes("-note-") ||
          name.includes("-form-") ||
          name.includes("-flow-")
        ) {
          if (!Array.isArray(questionAnswers[questionId].studentAnswer)) {
            questionAnswers[questionId].studentAnswer = []
          }
          questionAnswers[questionId].studentAnswer.push(input.value)
        } else if (input.type === "checkbox") {
          if (!Array.isArray(questionAnswers[questionId].studentAnswer)) {
            questionAnswers[questionId].studentAnswer = []
          }
          questionAnswers[questionId].studentAnswer.push(input.value)
        } else {
          questionAnswers[questionId].studentAnswer = input.value
        }
      }
    })
  
    Object.values(questionAnswers).forEach((answer) => {
      answers.push(answer)
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
      console.error("Lỗi:", error)
      alert("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.")
    }
  }
  
  function displayResults(result) {
    const questionsContainer = document.getElementById("questions-container")
    questionsContainer.style.display = "none"
  
    const submitButton = document.getElementById("submit-test")
    submitButton.style.display = "none"
  
    const resultsContainer = document.getElementById("results-container")
    resultsContainer.style.display = "block"
    resultsContainer.innerHTML = `
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Kết quả bài kiểm tra</h5>
        </div>
        <div class="card-body">
          <h4>Điểm số: ${result.score}%</h4>
          <p>Số câu đúng: ${result.correctCount}/${result.totalQuestions}</p>
          
          <div class="mt-4">
            <h5>Chi tiết kết quả:</h5>
            <table class="table">
              <thead>
                <tr>
                  <th>Câu hỏi</th>
                  <th>Kết quả</th>
                </tr>
              </thead>
              <tbody>
                ${result.results
                  .map(
                    (item, index) => `
                  <tr>
                    <td>Câu ${index + 1}</td>
                    <td>
                      <span class="badge ${item.isCorrect ? "bg-success" : "bg-danger"}">
                        ${item.isCorrect ? "Đúng" : "Sai"}
                      </span>
                    </td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          
          <div class="mt-4">
            <a href="/student" class="btn btn-primary">Quay lại danh sách bài thi</a>
          </div>
        </div>
      </div>
    `
  }
  
  function displayError(message) {
    const container = document.getElementById("test-container")
    container.innerHTML = `
      <div class="alert alert-danger">
        <h4>Lỗi!</h4>
        <p>${message}</p>
      </div>
      <a href="/student" class="btn btn-primary">Quay lại danh sách bài thi</a>
    `
  }
  