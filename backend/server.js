const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Phục vụ các file tĩnh từ thư mục frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Cấu hình routes API
const testRoutes = require('./routes/testRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/tests', testRoutes);
app.use('/api/users', userRoutes);

// Route mặc định trả về trang index.html chính
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Route cho student
app.get('/student/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/student/index.html'));
});

// Route cho teacher
app.get('/teacher/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/teacher/index.html'));
});

// Xử lý các route không tồn tại
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});