// Hàm lưu bài kiểm tra
async function saveTest() {
  try {
    // Hiển thị thông báo đang lưu
    showNotification("Đang lưu bài kiểm tra...", "info")

    // Lấy thông tin bài kiểm tra
    const title = document.getElementById("test-title").value
    const description = document.getElementById("test-description").value
    const duration = Number.parseInt(document.getElementById("test-duration").value) || 40
    const audioUrl = document.getElementById("test-audio-url").value

    // Kiểm tra tiêu đề
    if (!title) {
      showNotification("Vui lòng nhập tiêu đề bài kiểm tra", "error")
      return
    }

    // Lấy danh sách câu hỏi
    const questions = []
    const questionElements = document.querySelectorAll(".question-item")

    if (questionElements.length === 0) {
      showNotification("Vui lòng thêm ít nhất một câu hỏi", "error")
      return
    }

    // Duyệt qua từng câu hỏi
    for (let i = 0; i < questionElements.length; i++) {
      const questionElement = questionElements[i]
      const questionId = questionElement.dataset.id
      const questionType = questionElement.dataset.type
      const section = Number.parseInt(questionElement.dataset.section) || 1

      // Lấy dữ liệu câu hỏi từ DOM
      const questionData = getQuestionDataFromDOM(questionElement, questionType)

      if (!questionData) {
        showNotification(`Lỗi khi lấy dữ liệu câu hỏi #${i + 1}`, "error")
        return
      }

      // Thêm câu hỏi vào danh sách
      questions.push({
        id: questionId,
        type: questionType,
        section: section,
        content: questionData.content,
        answers: questionData.answers,
      })
    }

    // Tạo đối tượng dữ liệu để gửi lên server
    const testData = {
      title,
      description,
      duration,
      audioUrl,
      questions,
    }

    console.log("Test data to save:", testData)

    // Gửi dữ liệu lên server
    const token = localStorage.getItem("token")
    const response = await fetch("/api/tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(testData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Lỗi khi lưu bài kiểm tra")
    }

    // Hiển thị thông báo thành công
    showNotification("Lưu bài kiểm tra thành công!", "success")

    // Lưu ID bài kiểm tra vào localStorage
    localStorage.setItem("currentTestId", data.testId)

    return data
  } catch (error) {
    console.error("Error saving test:", error)
    showNotification(`Lỗi: ${error.message}`, "error")
    return null
  }
}

// Hàm lấy dữ liệu câu hỏi từ DOM
function getQuestionDataFromDOM(questionElement, questionType) {
  try {
    const content = {}
    let answers = {}

    switch (questionType) {
      case "multiple_choice":
        // Lấy nội dung câu hỏi
        content.question = questionElement.querySelector(".question-content").textContent.trim()

        // Lấy các lựa chọn
        content.choices = []
        const choiceElements = questionElement.querySelectorAll(".choice-item")
        choiceElements.forEach((choiceElement) => {
          content.choices.push(choiceElement.querySelector(".choice-text").textContent.trim())
        })

        // Lấy đáp án đúng
        const correctChoiceIndex = Array.from(choiceElements).findIndex(
          (choice) => choice.querySelector('input[type="radio"]').checked,
        )

        if (correctChoiceIndex === -1) {
          throw new Error("Vui lòng chọn đáp án đúng")
        }

        answers = correctChoiceIndex
        break

      case "multiple_answers":
        // Lấy nội dung câu hỏi
        content.question = questionElement.querySelector(".question-content").textContent.trim()

        // Lấy các lựa chọn
        content.choices = []
        const multiChoiceElements = questionElement.querySelectorAll(".choice-item")
        multiChoiceElements.forEach((choiceElement) => {
          content.choices.push(choiceElement.querySelector(".choice-text").textContent.trim())
        })

        // Lấy các đáp án đúng
        answers = []
        multiChoiceElements.forEach((choiceElement, index) => {
          if (choiceElement.querySelector('input[type="checkbox"]').checked) {
            answers.push(index)
          }
        })

        if (answers.length === 0) {
          throw new Error("Vui lòng chọn ít nhất một đáp án đúng")
        }
        break

      case "matching":
        // Lấy tiêu đề
        content.title = questionElement.querySelector(".matching-title").value.trim()

        // Lấy danh sách câu hỏi
        content.questions = []
        const matchingQuestions = questionElement.querySelectorAll(".matching-question")
        matchingQuestions.forEach((question) => {
          content.questions.push(question.value.trim())
        })

        // Lấy danh sách từ khóa
        content.keywords = []
        const matchingKeywords = questionElement.querySelectorAll(".matching-keyword")
        matchingKeywords.forEach((keyword) => {
          content.keywords.push(keyword.value.trim())
        })

        // Lấy đáp án
        answers = {}
        const matchingAnswers = questionElement.querySelectorAll(".matching-answer")
        matchingAnswers.forEach((answer, index) => {
          const keywordIndex = Number.parseInt(answer.value)
          if (!isNaN(keywordIndex)) {
            answers[index] = keywordIndex
          }
        })

        if (Object.keys(answers).length !== content.questions.length) {
          throw new Error("Vui lòng chọn đáp án cho tất cả các câu hỏi")
        }
        break

      case "map_labeling":
        // Lấy loại bản đồ
        content.mapType = questionElement.querySelector(".map-type").value.trim()

        // Lấy hướng dẫn
        content.instructions = questionElement.querySelector(".map-instructions").value.trim()

        // Lấy URL hình ảnh
        content.imageUrl = questionElement.querySelector(".map-image-url").value.trim()

        if (!content.imageUrl) {
          throw new Error("Vui lòng nhập URL hình ảnh bản đồ/sơ đồ")
        }

        // Lấy danh sách nhãn
        content.labels = []
        answers = {}

        const labelItems = questionElement.querySelectorAll(".label-item")
        labelItems.forEach((labelItem, index) => {
          const labelText = labelItem.querySelector(".label-text").value.trim()
          const labelAnswer = labelItem.querySelector(".label-answer").value.trim()

          if (labelText) {
            content.labels.push({
              id: index,
              text: labelText,
            })

            if (labelAnswer) {
              answers[index] = labelAnswer
            } else {
              throw new Error(`Vui lòng nhập đáp án cho nhãn "${labelText}"`)
            }
          }
        })

        if (content.labels.length === 0) {
          throw new Error("Vui lòng thêm ít nhất một nhãn")
        }
        break

      case "note_completion":
        // Lấy hướng dẫn
        content.instructions = questionElement.querySelector(".note-instructions").value.trim()

        // Lấy chủ đề
        content.topic = questionElement.querySelector(".note-topic").value.trim()

        // Lấy danh sách ghi chú
        content.notes = []
        answers = {}

        const noteItems = questionElement.querySelectorAll(".note-item")
        noteItems.forEach((noteItem, index) => {
          const noteText = noteItem.querySelector(".note-text").value.trim()
          const hasBlank = noteItem.querySelector(".note-has-blank").checked
          const noteAnswer = noteItem.querySelector(".note-answer").value.trim()

          if (noteText) {
            content.notes.push({
              id: index,
              text: noteText,
              hasBlank: hasBlank,
            })

            if (hasBlank) {
              if (noteAnswer) {
                answers[index] = noteAnswer
              } else {
                throw new Error(`Vui lòng nhập đáp án cho ghi chú "${noteText}"`)
              }
            }
          }
        })

        if (content.notes.length === 0) {
          throw new Error("Vui lòng thêm ít nhất một ghi chú")
        }
        break

      case "form_completion":
        // Lấy hướng dẫn
        content.instructions = questionElement.querySelector(".form-instructions").value.trim()

        // Lấy danh sách hàng
        content.rows = []
        answers = {}

        const formRows = questionElement.querySelectorAll(".form-row")
        formRows.forEach((formRow, index) => {
          const rowLabel = formRow.querySelector(".row-label").value.trim()
          const hasBlank = formRow.querySelector(".row-has-blank").checked
          const rowAnswer = formRow.querySelector(".row-answer").value.trim()

          if (rowLabel) {
            content.rows.push({
              id: index,
              label: rowLabel,
              hasBlank: hasBlank,
            })

            if (hasBlank) {
              if (rowAnswer) {
                answers[index] = rowAnswer
              } else {
                throw new Error(`Vui lòng nhập đáp án cho hàng "${rowLabel}"`)
              }
            }
          }
        })

        if (content.rows.length === 0) {
          throw new Error("Vui lòng thêm ít nhất một hàng")
        }
        break

      case "flow_chart":
        // Lấy tiêu đề
        content.title = questionElement.querySelector(".flow-chart-title").value.trim()

        // Lấy hướng dẫn
        content.instructions = questionElement.querySelector(".flow-chart-instructions").value.trim()

        // Lấy danh sách mục
        content.items = []
        answers = {}

        const flowItems = questionElement.querySelectorAll(".flow-item")
        flowItems.forEach((flowItem, index) => {
          const itemText = flowItem.querySelector(".item-text").value.trim()
          const hasBlank = flowItem.querySelector(".item-has-blank").checked

          if (itemText) {
            content.items.push({
              id: index,
              text: itemText,
              hasBlank: hasBlank,
            })

            if (hasBlank) {
              // Lấy các lựa chọn
              const itemChoices = []
              const choiceInputs = flowItem.querySelectorAll(".item-choice")
              choiceInputs.forEach((choiceInput) => {
                const choiceText = choiceInput.value.trim()
                if (choiceText) {
                  itemChoices.push(choiceText)
                }
              })

              content.choices = content.choices || {}
              content.choices[index] = itemChoices

              // Lấy đáp án
              const answerIndex = Number.parseInt(flowItem.querySelector(".item-answer").value)
              if (!isNaN(answerIndex) && answerIndex >= 0 && answerIndex < itemChoices.length) {
                answers[index] = answerIndex
              } else {
                throw new Error(`Vui lòng chọn đáp án cho mục "${itemText}"`)
              }
            }
          }
        })

        if (content.items.length === 0) {
          throw new Error("Vui lòng thêm ít nhất một mục")
        }
        break

      default:
        throw new Error(`Loại câu hỏi không hợp lệ: ${questionType}`)
    }

    return {
      content,
      answers,
    }
  } catch (error) {
    console.error("Error getting question data:", error)
    showNotification(error.message, "error")
    return null
  }
}

// Hàm hiển thị thông báo
function showNotification(message, type = "info") {
  const notification = document.getElementById("notification")
  notification.textContent = message
  notification.className = `notification ${type}`
  notification.style.display = "block"

  // Tự động ẩn thông báo sau 5 giây
  setTimeout(() => {
    notification.style.display = "none"
  }, 5000)
}

// Hàm lấy danh sách bài kiểm tra
async function fetchTests() {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch("/api/tests", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Không thể lấy danh sách bài kiểm tra")
    }

    const tests = await response.json()
    return tests
  } catch (error) {
    console.error("Error fetching tests:", error)
    showNotification(error.message, "error")
    return []
  }
}

// Hàm lấy thông tin bài kiểm tra theo ID
async function fetchTestById(testId) {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`/api/tests/${testId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Không thể lấy thông tin bài kiểm tra")
    }

    const test = await response.json()
    return test
  } catch (error) {
    console.error("Error fetching test:", error)
    showNotification(error.message, "error")
    return null
  }
}

// Hàm cập nhật bài kiểm tra
async function updateTest(testId, testData) {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`/api/tests/${testId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(testData),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || "Không thể cập nhật bài kiểm tra")
    }

    const data = await response.json()
    showNotification("Cập nhật bài kiểm tra thành công!", "success")
    return data
  } catch (error) {
    console.error("Error updating test:", error)
    showNotification(error.message, "error")
    return null
  }
}

// Hàm xóa bài kiểm tra
async function deleteTest(testId) {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`/api/tests/${testId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || "Không thể xóa bài kiểm tra")
    }

    const data = await response.json()
    showNotification("Xóa bài kiểm tra thành công!", "success")
    return data
  } catch (error) {
    console.error("Error deleting test:", error)
    showNotification(error.message, "error")
    return null
  }
}
