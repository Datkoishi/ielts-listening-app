CREATE DATABASE IF NOT EXISTS ielts_listening;
USE ielts_listening;

-- Bảng người dùng
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng bài kiểm tra
CREATE TABLE IF NOT EXISTS tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT DEFAULT 40,
    audio_url VARCHAR(255),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng câu hỏi
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    section INT DEFAULT 1,
    question_order INT NOT NULL,
    content JSON NOT NULL,
    answers JSON,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- Bảng nộp bài
CREATE TABLE IF NOT EXISTS submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    user_id INT,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    answers JSON NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Thêm dữ liệu mẫu cho người dùng
INSERT INTO users (username, password, email, role) VALUES
('teacher1', '$2b$10$X7FXzRpUFvI.AQRvR7V7O.RbgFBRlpfRcIzWmXr9VxJHCq4UCwZFW', 'teacher1@example.com', 'teacher'),
('student1', '$2b$10$X7FXzRpUFvI.AQRvR7V7O.RbgFBRlpfRcIzWmXr9VxJHCq4UCwZFW', 'student1@example.com', 'student');
-- Mật khẩu mẫu: password123
