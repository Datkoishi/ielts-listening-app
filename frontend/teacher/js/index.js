// Ensure the renderTestCreation function is called when the page loads
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM content loaded")
  
    // Check if functions are available
    console.log("Function availability check:", {
      addQuestionDirectly: typeof window.addQuestionDirectly,
      renderTestCreation: typeof window.renderTestCreation,
      startTestCreation: typeof window.startTestCreation,
    })
  
    // Add event listener for the start test button
    const startTestBtn = document.getElementById("startTestBtn")
    if (startTestBtn) {
      startTestBtn.addEventListener("click", () => {
        console.log("Start test button clicked")
        // Get selected question types
        const selectedTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(
          (cb) => cb.value,
        )
  
        if (selectedTypes.length === 0) {
          alert("Vui lòng chọn ít nhất một loại câu hỏi.")
          return
        }
  
        console.log("Selected types:", selectedTypes)
  
        // Hide selection page and show test creation page
        document.getElementById("selectionPage").classList.add("hidden")
        document.getElementById("testCreationPage").classList.remove("hidden")
  
        // Call startTestCreation if available
        if (typeof window.startTestCreation === "function") {
          console.log("Calling startTestCreation function")
          window.startTestCreation()
        } else {
          console.error("startTestCreation function not found in window object")
          alert("Error: startTestCreation function not found. Please refresh the page and try again.")
        }
      })
    } else {
      console.error("Start test button not found")
    }
  
    // Initialize other event listeners
    const previousPartBtn = document.getElementById("previousPartBtn")
    if (previousPartBtn) {
      previousPartBtn.addEventListener("click", () => {
        console.log("Previous part button clicked")
        if (typeof window.previousPart === "function") {
          window.previousPart()
        } else {
          console.error("previousPart function not found in window object")
        }
      })
    }
  
    const nextPartBtn = document.getElementById("nextPartBtn")
    if (nextPartBtn) {
      nextPartBtn.addEventListener("click", () => {
        console.log("Next part button clicked")
        if (typeof window.nextPart === "function") {
          window.nextPart()
        } else {
          console.error("nextPart function not found in window object")
        }
      })
    }
  
    const saveTestBtn = document.getElementById("saveTestBtn")
    if (saveTestBtn) {
      saveTestBtn.addEventListener("click", () => {
        if (typeof window.saveTest === "function") {
          window.saveTest()
        } else {
          console.error("saveTest function not found in window object")
        }
      })
    }
  })
  
  // Global function to handle question creation
  window.addQuestion = (questionType) => {
    console.log("Global addQuestion called with type:", questionType)
  
    if (typeof window.addQuestionDirectly === "function") {
      window.addQuestionDirectly(questionType)
    } else {
      console.error("addQuestionDirectly function not found")
      alert("Error: Cannot create question. Please refresh the page and try again.")
    }
  }
  
  