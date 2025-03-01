// Constants
const MAX_QUESTIONS = 40
const PARTS = 4

// Global variables
let selectedTypes = []
let currentPart = 1
let totalQuestions = 0
const audioFile = null
const audioDuration = 0
let test = {
  part1: [],
  part2: [],
  part3: [],
  part4: [],
}

// Form/Table Completion functions
function saveFormTableCompletion(container) {
  try {
    // Get instruction
    const instruction = container.querySelector("#tableInstruction")?.value?.trim()
    if (!instruction) {
      showT6Notification("Please enter instructions", "error", container.querySelector("#t6-notification"))
      return
    }

    // Get table rows (skip header row)
    const rows = Array.from(container.querySelector("#fareTable").querySelectorAll("tr")).slice(1)
    if (rows.length === 0) {
      showT6Notification("Please add at least one row to the table", "error", container.querySelector("#t6-notification"))
      return
    }

    // Collect row data and validate
    const tableData = []
    const correctAnswers = []
    let hasErrors = false

    rows.forEach((row, index) => {
      const transport = row.querySelector("input:nth-child(1)")?.value?.trim()
      const cashFare = row.querySelector("input:nth-child(2)")?.value?.trim()
      const cardFare = row.querySelector("input:nth-child(3)")?.value?.trim()
      const correctAnswer = row.querySelector(".t6-correct-answer-input")?.value?.trim()

      if (!transport || !cashFare || !cardFare) {
        showT6Notification(`Please fill in all fields for row ${index + 1}`, "error", container.querySelector("#t6-notification"))
        hasErrors = true
        return
      }

      if (!correctAnswer) {
        showT6Notification(`Please provide a correct answer for row ${index + 1}`, "error", container.querySelector("#t6-notification"))
        hasErrors = true
        return
      }

      tableData.push([transport, cashFare, cardFare])
      correctAnswers.push(correctAnswer)
    })

    if (hasErrors) {
      return null
    }

    // Create question object
    const questionData = {
      type: "Form/Table Completion",
      content: [instruction, ...tableData],
      correctAnswers
    }

    // Add to test object
    const part = Math.ceil(totalQuestions / 10) || 1
    if (part >= 1 && part <= 4) {
      if (!test[`part${part}`]) {
        test[`part${part}`] = []
      }
      test[`part${part}`].push(questionData)
      totalQuestions += correctAnswers.length
    }

    console.log("Saved Form/Table Completion question:", questionData)
    showT6Notification("Table saved successfully!", "success", container.querySelector("#t6-notification"))

    // Reset form
    container.querySelector("#tableInstruction").value = "Complete the table. Write NO MORE THAN ONE WORD AND/OR A NUMBER for each gap."
    const table = container.querySelector("#fareTable")
    while (table.rows.length > 1) {
      table.deleteRow(1)
    }

    return questionData
  } catch (error) {
    console.error("Error saving table:", error)
    showT6Notification(`Error saving table: ${error.message}`, "error", container.querySelector("#t6-notification"))
    return null
  }
}

function createFormTableCompletionForm() {
  return `
    <div class="t6-ielts-listening-creator">
      <div id="tableSection" class="t6-question-container">
        <div class="t6-form-group">
          <label for="tableInstruction">Instructions:</label>
          <textarea id="tableInstruction" rows="2">Complete the table. Write NO MORE THAN ONE WORD AND/OR A NUMBER for each gap.</textarea>
        </div>
        <div class="t6-table-container">
          <button type="button" class="t6-add-row-btn">Add Row</button>
          <table id="fareTable">
            <tr>
              <th>Transport</th>
              <th>Cash Fare</th>
              <th>Card Fare</th>
              <th>Correct Answer</th>
              <th>Actions</th>
            </tr>
          </table>
        </div>
        <div class="t6-button-group">
          <button type="button" class="t6-save-btn">Save Table</button>
        </div>
        <div id="t6-notification" class="t6-notification" style="display: none;"></div>
      </div>
    </div>
  `
}

function initializeFormTableCompletionForm(container) {
  if (!container) {
    console.error("Container not found")
    return
  }

  const addRowBtn = container.querySelector(".t6-add-row-btn")
  const saveBtn = container.querySelector(".t6-save-btn")
  const fareTable = container.querySelector("#fareTable")
  const notification = container.querySelector("#t6-notification")

  if (!addRowBtn || !saveBtn || !fareTable) {
    console.error("Required elements not found")
    return
  }

  // Add row button handler
  addRowBtn.addEventListener("click", () => {
    const newRow = fareTable.insertRow()
    newRow.innerHTML = `
      <td><input type="text" class="t6-transport-input" placeholder="Enter transport"></td>
      <td><input type="text" class="t6-cash-fare-input" placeholder="Enter cash fare"></td>
      <td><input type="text" class="t6-card-fare-input" placeholder="Enter card fare"></td>
      <td><input type="text" class="t6-correct-answer-input" placeholder="Enter correct answer"></td>
      <td><button type="button" class="t6-delete-btn">Delete</button></td>
    `
    setupDeleteButtons(container)
  })

  // Save button handler
  saveBtn.addEventListener("click", () => {
    const savedQuestion = saveFormTableCompletion(container)
    if (savedQuestion) {
      // Thêm vào bộ câu hỏi
      if (!test[`part${currentPart}`]) {
        test[`part${currentPart}`] = []
      }
      test[`part${currentPart}`].push(savedQuestion)
      
      // Cập nhật tổng số câu hỏi
      totalQuestions += savedQuestion.correctAnswers.length
      updateQuestionCount()
      
      // Hiển thị thông báo thành công
      showT6Notification("Question saved successfully!", "success", notification)
      
      // Reset form
      container.querySelector("#tableInstruction").value = "Complete the table. Write NO MORE THAN ONE WORD AND/OR A NUMBER for each gap."
      while (fareTable.rows.length > 1) {
        fareTable.deleteRow(1)
      }

      // Add a new empty row
      addRowBtn.click()
    }
  })

  // Initialize delete buttons
  setupDeleteButtons(container)

  // Add default row
  addRowBtn.click()
}
function setupDeleteButtons(container) {
    const deleteButtons = container.querySelectorAll(".t6-delete-btn")
    deleteButtons.forEach(button => {
      button.addEventListener("click", function() {
        this.closest("tr").remove()
      })
    })
  }
  
  function showT6Notification(message, type, notificationElement) {
    if (!notificationElement) return
  
    notificationElement.textContent = message
    notificationElement.className = `t6-notification t6-notification-${type}`
    notificationElement.style.display = "block"
  
    // Add styles
    notificationElement.style.padding = "10px"
    notificationElement.style.margin = "10px 0"
    notificationElement.style.borderRadius = "4px"
    notificationElement.style.marginTop = "1rem"
  
    if (type === "error") {
      notificationElement.style.backgroundColor = "#fee2e2"
      notificationElement.style.color = "#dc2626"
      notificationElement.style.border = "1px solid #dc2626"
    } else if (type === "success") {
      notificationElement.style.backgroundColor = "#dcfce7"
      notificationElement.style.color = "#16a34a"
      notificationElement.style.border = "1px solid #16a34a"
    }
  
    // Auto hide after 5 seconds
    setTimeout(() => {
      notificationElement.style.display = "none"
    }, 5000)
  }
  
  // Event Handlers
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("startTestBtn").addEventListener("click", startTestCreation)
    document.getElementById("previousPartBtn").addEventListener("click", previousPart)
    document.getElementById("nextPartBtn").addEventListener("click", nextPart)
    document.getElementById("saveTestBtn").addEventListener("click", saveTest)
  
    const previewTestBtn = document.createElement("button")
    previewTestBtn.id = "previewTestBtn"
    previewTestBtn.textContent = "Preview Test"
    previewTestBtn.addEventListener("click", previewEntireTest)
    document.getElementById("testCreationPage").appendChild(previewTestBtn)
  
    const exportTestBtn = document.createElement("button")
    exportTestBtn.id = "exportTestBtn"
    exportTestBtn.textContent = "Export Test"
    exportTestBtn.addEventListener("click", exportTest)
    document.getElementById("testCreationPage").appendChild(exportTestBtn)
  
    const importTestBtn = document.createElement("button")
    importTestBtn.id = "importTestBtn"
    importTestBtn.textContent = "Import Test"
    importTestBtn.addEventListener("click", importTest)
    document.getElementById("testCreationPage").appendChild(importTestBtn)
  
    // Thêm nút để lưu bộ câu hỏi
    const saveQuestionSetBtn = document.createElement("button")
    saveQuestionSetBtn.id = "saveQuestionSetBtn"
    saveQuestionSetBtn.textContent = "Lưu bộ câu hỏi"
    saveQuestionSetBtn.addEventListener("click", saveQuestionSet)
    document.getElementById("testCreationPage").appendChild(saveQuestionSetBtn)
  
    // Gọi hàm để lấy danh sách loại câu hỏi khi trang được tải
    fetchQuestionTypes()
  })
  
  function startTestCreation() {
    selectedTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value)
    if (selectedTypes.length === 0) {
      alert("Please select at least one question type.")
      return
    }
    document.getElementById("selectionPage").classList.add("hidden")
    document.getElementById("testCreationPage").classList.remove("hidden")
    renderTestCreation()
  }
  
  function renderTestCreation() {
    const testContent = document.getElementById("testContent")
    if (!testContent) {
      console.error("Test content container not found")
      return
    }
  
    testContent.innerHTML = `
      <div class="part-header">
        <h2><i class="fas fa-list-ol"></i> Part ${currentPart}</h2>
        <div class="question-count"><i class="fas fa-question-circle"></i> Total Questions: ${totalQuestions}/40</div>
      </div>
    `
  
    // Create all part containers if they don't exist
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
  }
  
  function renderQuestionTypes(container) {
    selectedTypes.forEach(type => {
      const questionDiv = document.createElement("div")
      questionDiv.className = "question"
      questionDiv.innerHTML = `
        <h3>${getIconForType(type)} ${type}</h3>
        <button onclick="addQuestion('${type}', ${currentPart})">
          <i class="fas fa-plus"></i> Add ${type} Question
        </button>
      `
      container.appendChild(questionDiv)
    })
  }
  
  function getIconForType(type) {
    const icons = {
      "One answer": '<i class="fas fa-check-circle"></i>',
      "More than one answer": '<i class="fas fa-check-double"></i>',
      "Matching": '<i class="fas fa-link"></i>',
      "Plan/Map/Diagram labelling": '<i class="fas fa-map-marker-alt"></i>',
      "Note Completion": '<i class="fas fa-sticky-note"></i>',
      "Form/Table Completion": '<i class="fas fa-table"></i>',
      "Flow chart Completion": '<i class="fas fa-project-diagram"></i>'
    }
    return icons[type] || '<i class="fas fa-question"></i>'
  }
  
  function addQuestion(type, partNumber) {
    if (totalQuestions >= 40) {
      alert("You have reached the maximum limit of 40 questions.")
      return
    }
  
    const part = document.getElementById(`part${partNumber}`)
    const questionNumber = totalQuestions + 1
    const questionDiv = document.createElement("div")
    questionDiv.className = "question"
  
    // Add the question type header
    const typeHeader = document.createElement("h3")
    typeHeader.textContent = type
    questionDiv.appendChild(typeHeader)
  
    // Add question number and delete button
    questionDiv.innerHTML += `
      <h4><i class="fas fa-question-circle"></i> Question ${questionNumber}</h4>
      <button class="delete-question" onclick="deleteQuestion(this)">
        <i class="fas fa-trash"></i>
      </button>
    `
  
    // Add the appropriate form based on type
    switch (type) {
      case "Form/Table Completion":
        questionDiv.innerHTML += createFormTableCompletionForm()
        break
      // Add other question types here...
      default:
        console.error("Unknown question type:", type)
        return
    }
  
    part.appendChild(questionDiv)
    totalQuestions++
    updateQuestionCount()
  
    // Initialize form functionality based on type
    switch (type) {
      case "Form/Table Completion":
        initializeFormTableCompletionForm(questionDiv)
        break
      // Initialize other question types here...
    }
  }