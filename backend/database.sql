-- Tạo cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS ielts_listening;
USE ielts_listening;

-- Tạo bảng người dùng
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('student', 'teacher', 'admin') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng bài kiểm tra
CREATE TABLE IF NOT EXISTS tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    vietnamese_name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng phần (parts) của bài kiểm tra
CREATE TABLE IF NOT EXISTS parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    part_number INT NOT NULL,
    audio_url VARCHAR(255),
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- Tạo bảng câu hỏi
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_id INT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    content JSON NOT NULL,
    correct_answers JSON NOT NULL,
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
);

-- Tạo bảng câu trả lời của học sinh
CREATE TABLE IF NOT EXISTS student_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    test_id INT NOT NULL,
    question_id INT NOT NULL,
    answer JSON NOT NULL,
    is_correct BOOLEAN NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Thêm dữ liệu mẫu cho bảng users
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2b$10$X7JlKGj.KuZ4qJzudP2Qb.vF.T2tKBSWVwGHXk0KIv4NZ6PGlMC8y', 'admin@example.com', 'admin'),
('teacher', '$2b$10$X7JlKGj.KuZ4qJzudP2Qb.vF.T2tKBSWVwGHXk0KIv4NZ6PGlMC8y', 'teacher@example.com', 'teacher'),
('student', '$2b$10$X7JlKGj.KuZ4qJzudP2Qb.vF.T2tKBSWVwGHXk0KIv4NZ6PGlMC8y', 'student@example.com', 'student');
