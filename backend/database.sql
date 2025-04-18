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

-- Thêm dữ liệu mẫu cho bảng tests
INSERT INTO tests (title, vietnamese_name, description) VALUES 
('IELTS Listening Test 1', 'Bài kiểm tra IELTS Listening 1', 'Bài kiểm tra IELTS Listening mẫu đầu tiên'),
('IELTS Listening Test 2', 'Bài kiểm tra IELTS Listening 2', 'Bài kiểm tra IELTS Listening mẫu thứ hai');

-- Thêm dữ liệu mẫu cho bảng parts
INSERT INTO parts (test_id, part_number, audio_url) VALUES 
(1, 1, 'https://example.com/audio/test1-part1.mp3'),
(1, 2, 'https://example.com/audio/test1-part2.mp3'),
(1, 3, 'https://example.com/audio/test1-part3.mp3'),
(1, 4, 'https://example.com/audio/test1-part4.mp3'),
(2, 1, 'https://example.com/audio/test2-part1.mp3'),
(2, 2, 'https://example.com/audio/test2-part2.mp3');

-- Thêm dữ liệu mẫu cho bảng questions - Part 1 của Test 1 (Multiple Choice - Single Answer)
INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES 
(1, 'multiple-choice-single', 
  '{"question": "What is the woman\'s destination?", "options": ["London", "Paris", "Berlin", "Rome"]}', 
  '"Paris"'),
(1, 'multiple-choice-single', 
  '{"question": "How will the woman travel to her destination?", "options": ["By train", "By bus", "By plane", "By car"]}', 
  '"By plane"'),
(1, 'multiple-choice-single', 
  '{"question": "What time does the woman\'s flight depart?", "options": ["9:30 AM", "10:15 AM", "11:45 AM", "1:20 PM"]}', 
  '"10:15 AM"');

-- Thêm dữ liệu mẫu cho bảng questions - Part 2 của Test 1 (Multiple Choice - Multiple Answers)
INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES 
(2, 'multiple-choice-multiple', 
  '{"question": "Which items did the speaker mention as essential for the trip?", "options": ["Passport", "Sunscreen", "Camera", "Water bottle", "Map", "First aid kit"]}', 
  '["Passport", "Sunscreen", "Water bottle"]'),
(2, 'multiple-choice-multiple', 
  '{"question": "Which activities will be available at the resort?", "options": ["Swimming", "Hiking", "Tennis", "Golf", "Cycling", "Yoga"]}', 
  '["Swimming", "Tennis", "Yoga"]');

-- Thêm dữ liệu mẫu cho bảng questions - Part 3 của Test 1 (Matching)
INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES 
(3, 'matching', 
  '{"title": "Match the people with their jobs", "questions": ["John", "Mary", "David", "Sarah", "Michael"], "options": ["Doctor", "Teacher", "Engineer", "Artist", "Chef"]}', 
  '["Doctor", "Teacher", "Engineer", "Artist", "Chef"]');

-- Thêm dữ liệu mẫu cho bảng questions - Part 3 của Test 1 (Plan/Map/Diagram Labelling)
INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES 
(3, 'plan-map-diagram', 
  '{"type": "map", "instructions": "Label the following places on the campus map", "imageUrl": "https://example.com/images/campus-map.jpg", "labels": [{"id": 1, "x": 100, "y": 150}, {"id": 2, "x": 250, "y": 200}, {"id": 3, "x": 400, "y": 300}], "options": ["Library", "Cafeteria", "Gymnasium", "Administration", "Lecture Hall"]}', 
  '["Library", "Cafeteria", "Gymnasium"]');

-- Thêm dữ liệu mẫu cho bảng questions - Part 4 của Test 1 (Note Completion)
INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES 
(4, 'note-completion', 
  '{"instructions": "Complete the notes below", "topic": "Marine Biology Lecture", "notes": ["The lecture focuses on the importance of _____ in marine ecosystems.", "Coral reefs are home to over _____ species of fish.", "The Great Barrier Reef stretches for _____ kilometers along the coast of Australia."]}', 
  '["coral reefs", "4000", "2300"]');

-- Thêm dữ liệu mẫu cho bảng questions - Part 4 của Test 1 (Form Completion)
INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES 
(4, 'form-completion', 
  '{"instructions": "Complete the form with the correct information", "rows": [{"label": "Name:", "answer": ""}, {"label": "Address:", "answer": ""}, {"label": "Phone:", "answer": ""}, {"label": "Email:", "answer": ""}, {"label": "Membership Type:", "answer": ""}]}', 
  '["John Smith", "123 Main Street", "555-1234", "john@example.com", "Premium"]');

-- Thêm dữ liệu mẫu cho bảng questions - Part 1 của Test 2 (Flow-Chart Completion)
INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES 
(5, 'flow-chart', 
  '{"title": "The Water Cycle", "instructions": "Complete the flow chart below", "items": ["Water evaporates from _____", "Water vapor forms _____", "_____ falls as precipitation", "Water collects in rivers and _____"], "options": ["oceans", "clouds", "rain", "lakes", "mountains", "soil"]}', 
  '["oceans", "clouds", "rain", "lakes"]');

-- Thêm dữ liệu mẫu cho bảng questions - Part 2 của Test 2 (Multiple Choice - Single Answer)
INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES 
(6, 'multiple-choice-single', 
  '{"question": "What is the main topic of the lecture?", "options": ["Climate change", "Renewable energy", "Ocean pollution", "Deforestation"]}', 
  '"Renewable energy"'),
(6, 'multiple-choice-single', 
  '{"question": "According to the speaker, which renewable energy source has the most potential?", "options": ["Solar", "Wind", "Hydroelectric", "Geothermal"]}', 
  '"Solar"'),
(6, 'multiple-choice-single', 
  '{"question": "By what percentage does the speaker suggest renewable energy usage should increase by 2030?", "options": ["15%", "25%", "40%", "50%"]}', 
  '"40%"');
