document.addEventListener("DOMContentLoaded", () => {
    fetchTests()
  })
  
  async function fetchTests() {
    try {
      const response = await fetch("/api/tests/public")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const tests = await response.json()
      displayTests(tests)
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài thi:", error)
      displayError("Không thể lấy danh sách bài thi")
    }
  }
  
  function displayTests(tests) {
    const testListContainer = document.getElementById("test-list")
    testListContainer.innerHTML = ""
  
    if (!tests || tests.length === 0) {
      testListContainer.innerHTML = `
        <div class="alert alert-info">
          Không có bài thi nào. Vui lòng quay lại sau.
        </div>
      `
      return
    }
  
    const testCards = tests.map(
      (test) => `
      <div class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${test.title}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${test.vietnamese_name || test.vietnameseName || ""}</h6>
            <p class="card-text">${test.description || "Không có mô tả"}</p>
            <a href="test.html?id=${test.id}" class="btn btn-primary">Làm bài</a>
          </div>
          <div class="card-footer text-muted">
            Ngày tạo: ${new Date(test.created_at).toLocaleDateString("vi-VN")}
          </div>
        </div>
      </div>
    `,
    )
  
    testListContainer.innerHTML = `
      <div class="row">
        ${testCards.join("")}
      </div>
    `
  }
  
  function displayError(message) {
    const testListContainer = document.getElementById("test-list")
    testListContainer.innerHTML = `
      <div class="alert alert-danger">
        <h4>Lỗi!</h4>
        <p>${message}</p>
        <p>Chi tiết lỗi: Không thể lấy danh sách bài thi</p>
      </div>
    `
  }
  