document.addEventListener("DOMContentLoaded", () => {
    // Lấy danh sách bài thi
    fetchTests()
  })
  
  // Lấy danh sách bài thi từ API
  async function fetchTests() {
    try {
      // Sửa đường dẫn API để phù hợp với cấu trúc server
      const response = await fetch("/tests/public")
      if (!response.ok) {
        throw new Error("Không thể lấy danh sách bài thi")
      }
  
      const tests = await response.json()
      displayTests(tests)
    } catch (error) {
      console.error("Lỗi:", error)
      document.getElementById("tests-container").innerHTML = `
              <div class="alert alert-danger" role="alert">
                  <h4 class="alert-heading">Lỗi!</h4>
                  <p>Không thể tải danh sách bài thi. Vui lòng thử lại sau.</p>
                  <hr>
                  <p class="mb-0">Chi tiết lỗi: ${error.message}</p>
              </div>
          `
    }
  }
  
  // Hiển thị danh sách bài thi
  function displayTests(tests) {
    const container = document.getElementById("tests-container")
  
    if (tests.length === 0) {
      container.innerHTML = `
              <div class="alert alert-info" role="alert">
                  Hiện tại chưa có bài thi nào.
              </div>
          `
      return
    }
  
    let html = ""
    tests.forEach((test) => {
      const date = new Date(test.created_at).toLocaleDateString("vi-VN")
      html += `
              <a href="test.html?id=${test.id}" class="list-group-item list-group-item-action">
                  <div class="d-flex w-100 justify-content-between">
                      <h5 class="mb-1">${test.title}</h5>
                      <small class="text-muted">${date}</small>
                  </div>
                  <p class="mb-1">${test.description || "Không có mô tả"}</p>
                  <small class="text-muted">${test.vietnamese_name || test.vietnameseName || ""}</small>
              </a>
          `
    })
  
    container.innerHTML = html
  }
  