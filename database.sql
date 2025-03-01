CREATE DATABASE IF NOT EXISTS ielts_listening;

USE ielts_listening;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    audio_file VARCHAR(255),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS question_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT,
    question_type_id INT,
    part INT CHECK (part BETWEEN 1 AND 4),
    content JSON NOT NULL,
    correct_answers JSON NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id),
    FOREIGN KEY (question_type_id) REFERENCES question_types(id)
);

CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    test_id INT,
    score DECIMAL(5,2),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (test_id) REFERENCES tests(id)
);

-- Insert sample question types
INSERT INTO question_types (name, description) VALUES
('One answer', 'Question with only one correct answer'),
('More than one answer', 'Question with multiple correct answers'),
('Matching', 'Match items from two lists'),
('Plan/Map/Diagram labelling', 'Label a plan, map, or diagram'),
('Note Completion', 'Complete notes with missing words'),
('Form/Table Completion', 'Fill in a form or complete a table'),
('Flow chart Completion', 'Complete a flow chart with missing information');

-- Insert a sample test
INSERT INTO tests (title, description, audio_file) VALUES
('IELTS Listening Practice Test 1', 'A practice test for IELTS Listening', 'audio/practice_test_1.mp3');

-- Insert sample questions
INSERT INTO questions (test_id, question_type_id, part, content, correct_answers) VALUES
(1, 1, 1, '{"question": "What is the woman\'s name?", "options": ["Sarah", "Emma", "Lisa", "Anna"]}', '"Emma"'),
(1, 2, 2, '{"question": "Which facilities are available at the hotel?", "options": ["Swimming pool", "Gym", "Restaurant", "Spa"]}', '["Swimming pool", "Restaurant"]'),
(1, 3, 3, '{"question": "Match the people with their roles:", "items": ["John", "Mary", "Peter"], "options": ["Manager", "Receptionist", "Chef"]}', '{"John": "Manager", "Mary": "Receptionist", "Peter": "Chef"}'),
(1, 4, 4, '{"question": "Label the map with the correct locations:", "image": "images/city_map.jpg", "labels": ["A", "B", "C", "D"]}', '{"A": "Library", "B": "Park", "C": "Hospital", "D": "School"}');