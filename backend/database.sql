-- Tạo bảng bài kiểm tra
CREATE TABLE IF NOT EXISTS tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  vietnamese_name VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  FOREIGN KEY (test_id) REFERENCES tests(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);
