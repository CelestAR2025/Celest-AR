// server.js (backend)
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'planet_quiz_db'
});

// Create tables if they don't exist
db.query(`
  CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

db.query(`
  CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    points INT NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
  )
`);

// API endpoints
app.post('/api/students', (req, res) => {
  const { name } = req.body;
  db.query('INSERT INTO students (name) VALUES (?)', [name], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, name });
  });
});

app.post('/api/scores', (req, res) => {
  const { studentId, points, difficulty } = req.body;
  db.query(
    'INSERT INTO scores (student_id, points, difficulty) VALUES (?, ?, ?)',
    [studentId, points, difficulty],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId });
    }
  );
});

app.get('/api/leaderboard', (req, res) => {
  db.query(`
    SELECT s.name, SUM(sc.points) as total_points 
    FROM students s
    JOIN scores sc ON s.id = sc.student_id
    GROUP BY s.id
    ORDER BY total_points DESC
  `, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.listen(5000, () => console.log('Server running on port 5000'));