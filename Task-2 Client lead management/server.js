const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve index.html when someone opens the website
app.use(express.static('.'));

// ─── Database Connection ───────────────────────────
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',   // 👈 change this to your MySQL password
  database: 'crm_db'
});

db.connect(err => {
  if (err) { console.log('❌ DB Error:', err.message); return; }
  console.log('✅ MySQL Connected!');
  createTables();
});

// ─── Create Tables ─────────────────────────────────
function createTables() {
  db.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    password VARCHAR(255)
  )`);

  db.query(`CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    source VARCHAR(100),
    status ENUM('new','contacted','converted') DEFAULT 'new',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  db.query(`CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    leadId INT,
    text TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create default admin (username: admin, password: admin123)
  db.query(`SELECT * FROM users WHERE username = 'admin'`, async (err, rows) => {
    if (rows.length === 0) {
      const hashed = await bcrypt.hash('admin123', 10);
      db.query(`INSERT INTO users (username, password) VALUES ('admin', ?)`, [hashed]);
      console.log('👤 Admin created → admin / admin123');
    }
  });
}

// ─── Auth Middleware ────────────────────────────────
function requireLogin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Please login first' });
  try {
    req.user = jwt.verify(token, 'secretkey123');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid session, please login again' });
  }
}

// ─── Routes ────────────────────────────────────────

// Login
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  db.query(`SELECT * FROM users WHERE username = ?`, [username], async (err, rows) => {
    if (rows.length === 0) return res.status(400).json({ message: 'User not found' });
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(400).json({ message: 'Wrong password' });
    const token = jwt.sign({ id: rows[0].id }, 'secretkey123', { expiresIn: '24h' });
    res.json({ token });
  });
});

// Get all leads
app.get('/leads', requireLogin, (req, res) => {
  db.query(`SELECT * FROM leads ORDER BY createdAt DESC`, (err, rows) => {
    res.json(rows);
  });
});

// Add a lead
app.post('/leads', requireLogin, (req, res) => {
  const { name, email, source } = req.body;
  db.query(`INSERT INTO leads (name, email, source) VALUES (?, ?, ?)`,
    [name, email, source],
    (err, result) => {
      res.json({ id: result.insertId, name, email, source, status: 'new' });
    }
  );
});

// Update lead status
app.put('/leads/:id', requireLogin, (req, res) => {
  const { status } = req.body;
  db.query(`UPDATE leads SET status = ? WHERE id = ?`,
    [status, req.params.id],
    () => res.json({ message: 'Status updated' })
  );
});

// Get notes for a lead
app.get('/leads/:id/notes', requireLogin, (req, res) => {
  db.query(`SELECT * FROM notes WHERE leadId = ? ORDER BY createdAt DESC`,
    [req.params.id],
    (err, rows) => res.json(rows)
  );
});

// Add a note
app.post('/leads/:id/notes', requireLogin, (req, res) => {
  const { text } = req.body;
  db.query(`INSERT INTO notes (leadId, text) VALUES (?, ?)`,
    [req.params.id, text],
    (err, result) => res.json({ id: result.insertId, text })
  );
});

// ─── Start Server ───────────────────────────────────
app.listen(3000, () => console.log('🚀 Open http://localhost:3000'));