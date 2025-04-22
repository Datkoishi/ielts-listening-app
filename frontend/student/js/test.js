document.addEventListener("DOMContentLoaded", () => {
  // Lấy ID bài thi từ URL
  const urlParams = new URLSearchParams(window.location.search)
  const testId = urlParams.get("id")

  if (!testId) {
    window.location.href = "index.html"
    return
  }

  // Biến toàn cục
  let currentTest = null
  const userAnswers = {}
  let currentSection = 1
  let timerInterval = null
  let remainingTime = 40 * 60 // 40 phút mặc định

  // Khởi tạo bài thi
  fetchTest(testId)

  // Xử lý nút nộp bài
  document.getElementById("submit-btn").addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn nộp bài?")) {
      submitTest()
    }
  })

  // Xử lý nút chuyển phần
  document.getElementById("prev-section-btn").addEventListener("click", () => {
    if (currentSection > 1) {
      currentSection--
      renderQuestions()
    }
  })

  document.getElementById("next-section-btn").addEventListener("click", () => {
    if (currentSection < 4) {
      currentSection++
      renderQuestions()
    }
  })

  // Hàm lấy thông tin bài thi
  async function fetchTest(testId) {
    try {
      const response = await fetch(`/api/tests/public/${testId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      currentTest = await response.json()

      // Khởi tạo bài thi
      initializeTest()
    } catch (error) {
      console.error("Error fetching test:", error)
      showNotification("Không thể tải bài thi. Vui lòng thử lại sau.", "error")
    }
  }

  // Hàm khởi tạo bài thi
  function initializeTest() {
    // Cập nhật tiêu đề
    document.getElementById("test-title").textContent = currentTest.title

    // Cập nhật thời gian
    if (currentTest.duration) {
      remainingTime = currentTest.duration * 60
    }
    updateTimer()

    // Bắt đầu đếm ngược
    startTimer()

    // Cập nhật audio
    if (currentTest.audio_url) {
      const audioSource = document.getElementById("audio-source")
      audioSource.src = currentTest.audio_url
      document.getElementById("audio-player").load()
    } else {
      document.querySelector(".audio-player").style.display = "none"
    }

    // Khởi tạo điều hướng câu hỏi
    initializeQuestionNavigation()

    // Hiển thị câu hỏi
    renderQuestions()
  }

  // Hàm khởi tạo điều hướng câu hỏi
  function initializeQuestionNavigation() {
    const navigationContainer = document.getElementById("question-navigation")
    navigationContainer.innerHTML = ""

    currentTest.questions.forEach((question, index) => {
      const navItem = document.createElement("div")
      navItem.className = "question-nav-item"
      navItem.textContent = index + 1
      navItem.dataset.index = index

      navItem.addEventListener("click", () => {
        // Tìm phần của câu hỏi
        const questionSection = question.section || 1
        currentSection = questionSection

        // Hiển thị câu hỏi
        renderQuestions()

        // Cuộn đến câu hỏi
        const questionElement = document.getElementById(`question-${question.id}`)
        if (questionElement) {
          questionElement.scrollIntoView({ behavior: "smooth" })
        }
      })

      navigationContainer.appendChild(navItem)
    })
  }

  // Hàm hiển thị câu hỏi
  function renderQuestions() {
    const questionsContainer = document.getElementById("questions-container")
    questionsContainer.innerHTML = ""

    // Lọc câu hỏi theo phần
    const sectionQuestions = currentTest.questions.filter((q) => (q.section || 1) === currentSection)

    if (sectionQuestions.length === 0) {
      questionsContainer.innerHTML = `
                <div class="alert alert-info">
                    Không có câu hỏi nào trong phần ${currentSection}.
                </div>
            `
      return
    }

    // Hiển thị tiêu đề phần
    const sectionTitle = document.createElement("div")
    sectionTitle.className = "section-title"
    sectionTitle.innerHTML = `<h3>Phần ${currentSection}</h3>`
    questionsContainer.appendChild(sectionTitle)

    // Hiển thị từng câu hỏi
    sectionQuestions.forEach((question) => {
      const questionElement = renderQuestion(question)
      questionsContainer.appendChild(questionElement)
    })

    // Cập nhật nút điều hướng phần
    document.getElementById("prev-section-btn").disabled = currentSection === 1
    document.getElementById("next-section-btn").disabled = currentSection === 4

    // Cập nhật thông tin phần
    document.getElementById("section-text").textContent = `Phần: ${currentSection}/4`

    // Cập nhật trạng thái câu hỏi
    updateQuestionStatus()
  }

  // Hàm hiển thị một câu hỏi
  function renderQuestion(question) {
    const questionCard = document.createElement("div")
    questionCard.className = "card question-card mb-3"
    questionCard.id = `question-${question.id}`

    // Kiểm tra nếu câu hỏi đã được trả lời
    if (userAnswers[question.id]) {
      questionCard.classList.add("answered")
    }

    const cardBody = document.createElement("div")
    cardBody.className = "card-body"

    // Hiển thị nội dung câu hỏi tùy theo loại
    switch (question.type) {
      case "multiple_choice":
        renderMultipleChoiceQuestion(cardBody, question)
        break
      case "multiple_answers":
        renderMultipleAnswersQuestion(cardBody, question)
        break
      case "matching":
        renderMatchingQuestion(cardBody, question)
        break
      case "map_labeling":
        renderMapLabelingQuestion(cardBody, question)
        break
      case "note_completion":
        renderNoteCompletionQuestion(cardBody, question)
        break
      case "form_completion":
        renderFormCompletionQuestion(cardBody, question)
        break
      case "flow_chart":
        renderFlowChartQuestion(cardBody, question)
        break
      default:
        cardBody.innerHTML = `<p>Loại câu hỏi không được hỗ trợ: ${question.type}</p>`
    }

    questionCard.appendChild(cardBody)
    return questionCard
  }

  // Hàm hiển thị câu hỏi trắc nghiệm một đáp án
  function renderMultipleChoiceQuestion(container, question) {
    const content = question.content

    // Hiển thị câu hỏi
    const questionText = document.createElement("p")
    questionText.className = "card-text mb-3"
    questionText.textContent = content.question
    container.appendChild(questionText)

    // Hiển thị các lựa chọn
    const choicesContainer = document.createElement("div")
    choicesContainer.className = "choices-container"

    content.choices.forEach((choice, index) => {
      const choiceItem = document.createElement("div")
      choiceItem.className = "form-check mb-2"

      const choiceInput = document.createElement("input")
      choiceInput.className = "form-check-input"
      choiceInput.type = "radio"
      choiceInput.name = `question-${question.id}`
      choiceInput.id = `question-${question.id}-choice-${index}`
      choiceInput.value = index

      // Kiểm tra nếu đã chọn
      if (userAnswers[question.id] === index) {
        choiceInput.checked = true
      }

      // Xử lý sự kiện khi chọn
      choiceInput.addEventListener("change", () => {
        userAnswers[question.id] = index
        updateQuestionStatus()
      })

      const choiceLabel = document.createElement("label")
      choiceLabel.className = "form-check-label"
      choiceLabel.htmlFor = `question-${question.id}-choice-${index}`
      choiceLabel.textContent = choice

      choiceItem.appendChild(choiceInput)
      choiceItem.appendChild(choiceLabel)
      choicesContainer.appendChild(choiceItem)
    })

    container.appendChild(choicesContainer)
  }

  // Hàm hiển thị câu hỏi trắc nghiệm nhiều đáp án
  function renderMultipleAnswersQuestion(container, question) {
    const content = question.content

    // Hiển thị câu hỏi
    const questionText = document.createElement("p")
    questionText.className = "card-text mb-3"
    questionText.textContent = content.question
    container.appendChild(questionText)

    // Hiển thị các lựa chọn
    const choicesContainer = document.createElement("div")
    choicesContainer.className = "choices-container"

    content.choices.forEach((choice, index) => {
      const choiceItem = document.createElement("div")
      choiceItem.className = "form-check mb-2"

      const choiceInput = document.createElement("input")
      choiceInput.className = "form-check-input"
      choiceInput.type = "checkbox"
      choiceInput.name = `question-${question.id}`
      choiceInput.id = `question-${question.id}-choice-${index}`
      choiceInput.value = index

      // Kiểm tra nếu đã chọn
      if (userAnswers[question.id] && userAnswers[question.id].includes(index)) {
        choiceInput.checked = true
      }

      // Xử lý sự kiện khi chọn
      choiceInput.addEventListener("change", () => {
        if (!userAnswers[question.id]) {
          userAnswers[question.id] = []
        }

        if (choiceInput.checked) {
          if (!userAnswers[question.id].includes(index)) {
            userAnswers[question.id].push(index)
          }
        } else {
          userAnswers[question.id] = userAnswers[question.id].filter((i) => i !== index)
        }

        updateQuestionStatus()
      })

      const choiceLabel = document.createElement("label")
      choiceLabel.className = "form-check-label"
      choiceLabel.htmlFor = `question-${question.id}-choice-${index}`
      choiceLabel.textContent = choice

      choiceItem.appendChild(choiceInput)
      choiceItem.appendChild(choiceLabel)
      choicesContainer.appendChild(choiceItem)
    })

    container.appendChild(choicesContainer)
  }

  // Hàm hiển thị câu hỏi ghép nối
  function renderMatchingQuestion(container, question) {
    const content = question.content

    // Hiển thị tiêu đề
    const title = document.createElement("h5")
    title.className = "card-title mb-3"
    title.textContent = content.title || "Ghép nối các câu sau"
    container.appendChild(title)

    // Tạo bảng ghép nối
    const matchingTable = document.createElement("table")
    matchingTable.className = "table table-bordered"

    // Tạo header
    const thead = document.createElement("thead")
    const headerRow = document.createElement("tr")

    const questionHeader = document.createElement("th")
    questionHeader.textContent = "Câu hỏi"
    headerRow.appendChild(questionHeader)

    const answerHeader = document.createElement("th")
    answerHeader.textContent = "Đáp án"
    headerRow.appendChild(answerHeader)

    thead.appendChild(headerRow)
    matchingTable.appendChild(thead)

    // Tạo body
    const tbody = document.createElement("tbody")

    content.questions.forEach((q, index) => {
      const row = document.createElement("tr")

      // Cột câu hỏi
      const questionCell = document.createElement("td")
      questionCell.textContent = q
      row.appendChild(questionCell)

      // Cột đáp án
      const answerCell = document.createElement("td")
      const selectElement = document.createElement("select")
      selectElement.className = "form-select"
      selectElement.name = `question-${question.id}-match-${index}`

      // Thêm option mặc định
      const defaultOption = document.createElement("option")
      defaultOption.value = ""
      defaultOption.textContent = "-- Chọn đáp án --"
      selectElement.appendChild(defaultOption)

      // Thêm các từ khóa
      content.keywords.forEach((keyword, keywordIndex) => {
        const option = document.createElement("option")
        option.value = keywordIndex
        option.textContent = keyword

        // Kiểm tra nếu đã chọn
        if (userAnswers[question.id] && userAnswers[question.id][index] === keywordIndex) {
          option.selected = true
        }

        selectElement.appendChild(option)
      })

      // Xử lý sự kiện khi chọn
      selectElement.addEventListener("change", () => {
        if (!userAnswers[question.id]) {
          userAnswers[question.id] = {}
        }

        if (selectElement.value) {
          userAnswers[question.id][index] = Number.parseInt(selectElement.value)
        } else {
          delete userAnswers[question.id][index]
        }

        updateQuestionStatus()
      })

      answerCell.appendChild(selectElement)
      row.appendChild(answerCell)

      tbody.appendChild(row)
    })

    matchingTable.appendChild(tbody)
    container.appendChild(matchingTable)
  }

  // Hàm hiển thị câu hỏi ghi nhãn bản đồ/sơ đồ
  function renderMapLabelingQuestion(container, question) {
    const content = question.content

    // Hiển thị hướng dẫn
    const instructions = document.createElement("p")
    instructions.className = "card-text mb-3"
    instructions.textContent = content.instructions || "Điền các nhãn vào bản đồ/sơ đồ"
    container.appendChild(instructions)

    // Hiển thị hình ảnh
    if (content.imageUrl) {
      const imageContainer = document.createElement("div")
      imageContainer.className = "text-center mb-3"

      const image = document.createElement("img")
      image.src = content.imageUrl
      image.alt = content.mapType || "Map/Diagram"
      image.className = "img-fluid"
      image.style.maxHeight = "400px"

      imageContainer.appendChild(image)
      container.appendChild(imageContainer)
    }

    // Hiển thị các nhãn
    const labelsContainer = document.createElement("div")
    labelsContainer.className = "row g-3 mb-3"

    content.labels.forEach((label) => {
      const labelCol = document.createElement("div")
      labelCol.className = "col-md-6"

      const labelGroup = document.createElement("div")
      labelGroup.className = "input-group mb-2"

      const labelText = document.createElement("span")
      labelText.className = "input-group-text"
      labelText.textContent = label.text

      const labelInput = document.createElement("input")
      labelInput.type = "text"
      labelInput.className = "form-control"
      labelInput.placeholder = "Nhập đáp án"
      labelInput.name = `question-${question.id}-label-${label.id}`

      // Kiểm tra nếu đã nhập
      if (userAnswers[question.id] && userAnswers[question.id][label.id]) {
        labelInput.value = userAnswers[question.id][label.id]
      }

      // Xử lý sự kiện khi nhập
      labelInput.addEventListener("input", () => {
        if (!userAnswers[question.id]) {
          userAnswers[question.id] = {}
        }

        userAnswers[question.id][label.id] = labelInput.value.trim()
        updateQuestionStatus()
      })

      labelGroup.appendChild(labelText)
      labelGroup.appendChild(labelInput)
      labelCol.appendChild(labelGroup)
      labelsContainer.appendChild(labelCol)
    })

    container.appendChild(labelsContainer)
  }

  // Hàm hiển thị câu hỏi hoàn thành ghi chú
  function renderNoteCompletionQuestion(container, question) {
    const content = question.content

    // Hiển thị hướng dẫn
    const instructions = document.createElement("p")
    instructions.className = "card-text mb-3"
    instructions.textContent = content.instructions || "Hoàn thành các ghi chú sau"
    container.appendChild(instructions)

    // Hiển thị chủ đề
    if (content.topic) {
      const topic = document.createElement("h5")
      topic.className = "card-title mb-3"
      topic.textContent = content.topic
      container.appendChild(topic)
    }

    // Hiển thị các ghi chú
    const notesContainer = document.createElement("div")
    notesContainer.className = "list-group mb-3"

    content.notes.forEach((note) => {
      const noteItem = document.createElement("div")
      noteItem.className = "list-group-item"

      if (note.hasBlank) {
        // Tạo input nếu có chỗ trống
        const noteGroup = document.createElement("div")
        noteGroup.className = "d-flex align-items-center"

        const noteText = document.createElement("span")
        noteText.className = "me-2"
        noteText.textContent = note.text

        const noteInput = document.createElement("input")
        noteInput.type = "text"
        noteInput.className = "form-control"
        noteInput.style.width = "200px"
        noteInput.placeholder = "Nhập đáp án"
        noteInput.name = `question-${question.id}-note-${note.id}`

        // Kiểm tra nếu đã nhập
        if (userAnswers[question.id] && userAnswers[question.id][note.id]) {
          noteInput.value = userAnswers[question.id][note.id]
        }

        // Xử lý sự kiện khi nhập
        noteInput.addEventListener("input", () => {
          if (!userAnswers[question.id]) {
            userAnswers[question.id] = {}
          }

          userAnswers[question.id][note.id] = noteInput.value.trim()
          updateQuestionStatus()
        })

        noteGroup.appendChild(noteText)
        noteGroup.appendChild(noteInput)
        noteItem.appendChild(noteGroup)
      } else {
        // Hiển thị text nếu không có chỗ trống
        noteItem.textContent = note.text
      }

      notesContainer.appendChild(noteItem)
    })

    container.appendChild(notesContainer)
  }

  // Hàm hiển thị câu hỏi hoàn thành biểu mẫu
  function renderFormCompletionQuestion(container, question) {
    const content = question.content

    // Hiển thị hướng dẫn
    const instructions = document.createElement("p")
    instructions.className = "card-text mb-3"
    instructions.textContent = content.instructions || "Hoàn thành biểu mẫu sau"
    container.appendChild(instructions)

    // Tạo bảng
    const formTable = document.createElement("table")
    formTable.className = "table table-bordered"

    // Tạo body
    const tbody = document.createElement("tbody")

    content.rows.forEach((row) => {
      const tableRow = document.createElement("tr")

      // Cột nhãn
      const labelCell = document.createElement("td")
      labelCell.style.width = "40%"
      labelCell.textContent = row.label
      tableRow.appendChild(labelCell)

      // Cột đáp án
      const answerCell = document.createElement("td")

      if (row.hasBlank) {
        const answerInput = document.createElement("input")
        answerInput.type = "text"
        answerInput.className = "form-control"
        answerInput.placeholder = "Nhập đáp án"
        answerInput.name = `question-${question.id}-row-${row.id}`

        // Kiểm tra nếu đã nhập
        if (userAnswers[question.id] && userAnswers[question.id][row.id]) {
          answerInput.value = userAnswers[question.id][row.id]
        }

        // Xử lý sự kiện khi nhập
        answerInput.addEventListener("input", () => {
          if (!userAnswers[question.id]) {
            userAnswers[question.id] = {}
          }

          userAnswers[question.id][row.id] = answerInput.value.trim()
          updateQuestionStatus()
        })

        answerCell.appendChild(answerInput)
      } else {
        answerCell.textContent = "(không cần điền)"
      }

      tableRow.appendChild(answerCell)
      tbody.appendChild(tableRow)
    })

    formTable.appendChild(tbody)
    container.appendChild(formTable)
  }

  // Hàm hiển thị câu hỏi hoàn thành lưu đồ
  function renderFlowChartQuestion(container, question) {
    const content = question.content

    // Hiển thị tiêu đề
    const title = document.createElement("h5")
    title.className = "card-title mb-3"
    title.textContent = content.title || "Hoàn thành lưu đồ"
    container.appendChild(title)

    // Hiển thị hướng dẫn
    const instructions = document.createElement("p")
    instructions.className = "card-text mb-3"
    instructions.textContent = content.instructions || "Chọn từ thích hợp để hoàn thành lưu đồ"
    container.appendChild(instructions)

    // Hiển thị các mục
    const itemsContainer = document.createElement("div")
    itemsContainer.className = "list-group mb-3"

    content.items.forEach((item) => {
      const itemElement = document.createElement("div")
      itemElement.className = "list-group-item"

      if (item.hasBlank) {
        // Tạo dropdown nếu có chỗ trống
        const itemGroup = document.createElement("div")
        itemGroup.className = "d-flex align-items-center"

        const itemText = document.createElement("span")
        itemText.className = "me-2"
        itemText.textContent = item.text

        const itemSelect = document.createElement("select")
        itemSelect.className = "form-select"
        itemSelect.style.width = "200px"
        itemSelect.name = `question-${question.id}-item-${item.id}`

        // Thêm option mặc định
        const defaultOption = document.createElement("option")
        defaultOption.value = ""
        defaultOption.textContent = "-- Chọn đáp án --"
        itemSelect.appendChild(defaultOption)

        // Thêm các lựa chọn
        if (content.choices && content.choices[item.id]) {
          content.choices[item.id].forEach((choice, choiceIndex) => {
            const option = document.createElement("option")
            option.value = choiceIndex
            option.textContent = choice

            // Kiểm tra nếu đã chọn
            if (userAnswers[question.id] && userAnswers[question.id][item.id] === choiceIndex) {
              option.selected = true
            }

            itemSelect.appendChild(option)
          })
        }

        // Xử lý sự kiện khi chọn
        itemSelect.addEventListener("change", () => {
          if (!userAnswers[question.id]) {
            userAnswers[question.id] = {}
          }

          if (itemSelect.value) {
            userAnswers[question.id][item.id] = Number.parseInt(itemSelect.value)
          } else {
            delete userAnswers[question.id][item.id]
          }

          updateQuestionStatus()
        })

        itemGroup.appendChild(itemText)
        itemGroup.appendChild(itemSelect)
        itemElement.appendChild(itemGroup)
      } else {
        // Hiển thị text nếu không có chỗ trống
        itemElement.textContent = item.text
      }

      itemsContainer.appendChild(itemElement)
    })

    container.appendChild(itemsContainer)
  }

  // Hàm cập nhật trạng thái câu hỏi
  function updateQuestionStatus() {
    // Đếm số câu hỏi đã trả lời
    let answeredCount = 0
    const totalQuestions = currentTest.questions.length

    // Cập nhật trạng thái từng câu hỏi
    currentTest.questions.forEach((question, index) => {
      const navItem = document.querySelector(`.question-nav-item[data-index="${index}"]`)
      const questionCard = document.getElementById(`question-${question.id}`)

      // Kiểm tra nếu câu hỏi đã được trả lời
      const isAnswered = checkQuestionAnswered(question)

      if (isAnswered) {
        answeredCount++
        navItem.classList.add("answered")
        if (questionCard) {
          questionCard.classList.add("answered")
        }
      } else {
        navItem.classList.remove("answered")
        if (questionCard) {
          questionCard.classList.remove("answered")
        }
      }
    })

    // Cập nhật thanh tiến trình
    const progressBar = document.getElementById("progress-bar")
    const progressText = document.getElementById("progress-text")
    const percentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

    progressBar.style.width = `${percentage}%`
    progressText.textContent = `Đã trả lời: ${answeredCount}/${totalQuestions}`
  }

  // Hàm kiểm tra câu hỏi đã được trả lời chưa
  function checkQuestionAnswered(question) {
    if (!userAnswers[question.id]) {
      return false
    }

    switch (question.type) {
      case "multiple_choice":
        return userAnswers[question.id] !== undefined

      case "multiple_answers":
        return Array.isArray(userAnswers[question.id]) && userAnswers[question.id].length > 0

      case "matching":
        // Kiểm tra số lượng câu hỏi đã ghép nối
        const matchedCount = Object.keys(userAnswers[question.id]).length
        return matchedCount === question.content.questions.length

      case "map_labeling":
        // Kiểm tra số lượng nhãn đã điền
        const labelCount = Object.keys(userAnswers[question.id]).length
        const requiredLabelCount = question.content.labels.length
        return labelCount === requiredLabelCount

      case "note_completion":
        // Đếm số ghi chú có chỗ trống
        let requiredNoteCount = 0
        question.content.notes.forEach((note) => {
          if (note.hasBlank) {
            requiredNoteCount++
          }
        })

        // Kiểm tra số lượng ghi chú đã điền
        const filledNoteCount = Object.keys(userAnswers[question.id]).length
        return filledNoteCount === requiredNoteCount

      case "form_completion":
        // Đếm số hàng có chỗ trống
        let requiredRowCount = 0
        question.content.rows.forEach((row) => {
          if (row.hasBlank) {
            requiredRowCount++
          }
        })

        // Kiểm tra số lượng hàng đã điền
        const filledRowCount = Object.keys(userAnswers[question.id]).length
        return filledRowCount === requiredRowCount

      case "flow_chart":
        // Đếm số mục có chỗ trống
        let requiredItemCount = 0
        question.content.items.forEach((item) => {
          if (item.hasBlank) {
            requiredItemCount++
          }
        })

        // Kiểm tra số lượng mục đã điền
        const filledItemCount = Object.keys(userAnswers[question.id]).length
        return filledItemCount === requiredItemCount

      default:
        return false
    }
  }

  // Hàm bắt đầu đếm ngược
  function startTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
    }

    timerInterval = setInterval(() => {
      remainingTime--
      updateTimer()

      if (remainingTime <= 0) {
        clearInterval(timerInterval)
        submitTest()
      }
    }, 1000)
  }

  // Hàm cập nhật hiển thị thời gian
  function updateTimer() {
    const minutes = Math.floor(remainingTime / 60)
    const seconds = remainingTime % 60

    document.getElementById("timer").textContent =
      `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Hàm nộp bài
  async function submitTest() {
    try {
      // Dừng đếm ngược
      if (timerInterval) {
        clearInterval(timerInterval)
      }

      // Hiển thị thông báo đang nộp bài
      showNotification("Đang nộp bài...", "info")

      // Gửi dữ liệu lên server
      const response = await fetch(`/api/tests/public/${testId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers: userAnswers }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const result = await response.json()

      // Hiển thị kết quả
      displayResult(result)
    } catch (error) {
      console.error("Error submitting test:", error)
      showNotification("Lỗi khi nộp bài. Vui lòng thử lại.", "error")
    }
  }

  // Hàm hiển thị kết quả
  function displayResult(result) {
    // Ẩn phần làm bài
    document.getElementById("test-container").style.display = "none"

    // Hiển thị phần kết quả
    const resultContainer = document.getElementById("result-container")
    resultContainer.style.display = "block"

    // Cập nhật điểm số
    document.getElementById("result-score").textContent = `${result.score}/${result.totalQuestions}`
    document.getElementById("result-percentage").textContent = `${result.percentage}%`

    // Hiển thị chi tiết kết quả
    const resultDetail = document.getElementById("result-detail")
    resultDetail.innerHTML = ""

    result.results.forEach((item, index) => {
      const question = currentTest.questions.find((q) => q.id === item.questionId)

      if (!question) return

      const resultItem = document.createElement("div")
      resultItem.className = `result-item ${item.isCorrect ? "correct" : "incorrect"}`

      // Hiển thị thông tin câu hỏi
      const questionInfo = document.createElement("div")
      questionInfo.className = "d-flex justify-content-between align-items-center"

      const questionNumber = document.createElement("h6")
      questionNumber.textContent = `Câu ${index + 1}`

      const questionResult = document.createElement("span")
      questionResult.className = `badge ${item.isCorrect ? "bg-success" : "bg-danger"}`
      questionResult.textContent = item.isCorrect ? "Đúng" : "Sai"

      questionInfo.appendChild(questionNumber)
      questionInfo.appendChild(questionResult)
      resultItem.appendChild(questionInfo)

      // Hiển thị nội dung câu hỏi
      const questionContent = document.createElement("div")
      questionContent.className = "mt-2"

      switch (question.type) {
        case "multiple_choice":
          questionContent.innerHTML = `
                        <p>${question.content.question}</p>
                        <p><strong>Đáp án của bạn:</strong> ${item.userAnswer !== undefined ? question.content.choices[item.userAnswer] : "Không trả lời"}</p>
                        <p><strong>Đáp án đúng:</strong> ${question.content.choices[item.correctAnswer]}</p>
                    `
          break

        case "multiple_answers":
          const userAnswersText =
            item.userAnswer && item.userAnswer.length > 0
              ? item.userAnswer.map((i) => question.content.choices[i]).join(", ")
              : "Không trả lời"

          const correctAnswersText =
            item.correctAnswer && item.correctAnswer.length > 0
              ? item.correctAnswer.map((i) => question.content.choices[i]).join(", ")
              : ""

          questionContent.innerHTML = `
                        <p>${question.content.question}</p>
                        <p><strong>Đáp án của bạn:</strong> ${userAnswersText}</p>
                        <p><strong>Đáp án đúng:</strong> ${correctAnswersText}</p>
                    `
          break

        default:
          questionContent.innerHTML = `
                        <p><strong>Loại câu hỏi:</strong> ${getQuestionTypeName(question.type)}</p>
                        <p><strong>Đáp án của bạn:</strong> ${JSON.stringify(item.userAnswer || {})}</p>
                        <p><strong>Đáp án đúng:</strong> ${JSON.stringify(item.correctAnswer || {})}</p>
                    `
      }

      resultItem.appendChild(questionContent)
      resultDetail.appendChild(resultItem)
    })
  }

  // Hàm lấy tên loại câu hỏi
  function getQuestionTypeName(type) {
    switch (type) {
      case "multiple_choice":
        return "Trắc nghiệm một đáp án"
      case "multiple_answers":
        return "Trắc nghiệm nhiều đáp án"
      case "matching":
        return "Ghép nối"
      case "map_labeling":
        return "Ghi nhãn bản đồ/sơ đồ"
      case "note_completion":
        return "Hoàn thành ghi chú"
      case "form_completion":
        return "Hoàn thành biểu mẫu"
      case "flow_chart":
        return "Hoàn thành lưu đồ"
      default:
        return type
    }
  }

  // Hàm hiển thị thông báo
  function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `alert alert-${type} alert-dismissible fade show`
    notification.textContent = message
    notification.setAttribute("role", "alert")

    const closeButton = document.createElement("button")
    closeButton.type = "button"
    closeButton.className = "btn-close"
    closeButton.setAttribute("data-bs-dismiss", "alert")
    closeButton.setAttribute("aria-label", "Close")
    notification.appendChild(closeButton)

    document.getElementById("notification-container").appendChild(notification)

    // Tự động ẩn sau 5 giây
    setTimeout(() => {
      notification.remove()
    }, 5000)
  }
})
