const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'students.json');

app.use(cors());
app.use(express.json());

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Get all students
app.get('/api/students', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// Add a student
app.post('/api/students', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const students = JSON.parse(data);
        
        const newStudent = {
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            course: req.body.course,
            status: req.body.status || 'Active',
            enrolledAt: new Date().toISOString()
        };
        
        students.push(newStudent);
        fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
        
        res.status(201).json(newStudent);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Update a student
app.put('/api/students/:id', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        let students = JSON.parse(data);
        const index = students.findIndex(s => s.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        students[index] = { ...students[index], ...req.body };
        fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
        
        res.json(students[index]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update data' });
    }
});

// Delete a student
app.delete('/api/students/:id', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        let students = JSON.parse(data);
        const filteredStudents = students.filter(s => s.id !== req.params.id);
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(filteredStudents, null, 2));
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete data' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
