// Quản lý xác thực và token

// Lưu token vào localStorage
function saveToken(token) {
    localStorage.setItem("token", token)
  }
  
  // Lấy token từ localStorage
  function getToken() {
    return localStorage.getItem("token")
  }
  
  // Xóa token (đăng xuất)
  function removeToken() {
    localStorage.removeItem("token")
  }
  
  // Kiểm tra đã đăng nhập chưa
  function isLoggedIn() {
    return !!getToken()
  }
  
  // Tạo token tạm thời cho môi trường phát triển
  function createDevelopmentToken() {
    // Chỉ sử dụng trong môi trường phát triển
    const devToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6InRlYWNoZXIiLCJyb2xlIjoidGVhY2hlciJ9LCJpYXQiOjE2MTk3MjM2MjIsImV4cCI6MTkzNTMwMDgyMn0.fake-token-for-development"
    saveToken(devToken)
    console.log("Đã tạo token phát triển tạm thời")
    return devToken
  }
  
  // Đảm bảo có token xác thực
  function ensureAuthToken() {
    let token = getToken()
  
    // Nếu không có token, tạo token tạm thời cho môi trường phát triển
    if (!token) {
      token = createDevelopmentToken()
    }
  
    return token
  }
  
  // Xuất các hàm để sử dụng trong các file khác
  window.saveToken = saveToken
  window.getToken = getToken
  window.removeToken = removeToken
  window.isLoggedIn = isLoggedIn
  window.ensureAuthToken = ensureAuthToken
  