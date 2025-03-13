-- Tạo bảng người dùng
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng bài kiểm tra
CREATE TABLE IF NOT EXISTS tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tạo bảng phần
CREATE TABLE IF NOT EXISTS parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_id INT,
  part_number INT NOT NULL,
  audio_url VARCHAR(255),
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- Tạo bảng câu hỏi
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  part_id INT,
  question_type VARCHAR(50) NOT NULL,
  content JSON NOT NULL,
  correct_answers JSON NOT NULL,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
);

-- Tạo bảng câu trả lời của học sinh
CREATE TABLE IF NOT EXISTS student_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  test_id INT,
  question_id INT,
  answer TEXT,
  is_correct BOOLEAN,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (test_id) REFERENCES tests(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- Chèn tài khoản giáo viên mặc định
INSERT INTO users (username, password, role) 
VALUES ('teacher', '$2a$10$your_hashed_password', 'teacher');

-- Chèn tài khoản học sinh mặc định
INSERT INTO users (username, password, role) 
VALUES ('student', '$2a$10$your_hashed_password', 'student');

