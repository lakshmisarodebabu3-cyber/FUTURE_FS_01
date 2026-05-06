// server.js — Main Express backend for Lakshmi SB Portfolio
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS — allow frontend to talk to backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// ─── Helper: input validation ────────────────────────
function validateContactInput({ name, email, subject, message }) {
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
  if (!subject || subject.trim().length < 2) errors.push('Subject is required');
  if (!message || message.trim().length < 10) errors.push('Message must be at least 10 characters');
  return errors;
}

// ─── Routes ──────────────────────────────────────────

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Lakshmi SB Portfolio API is live 🚀',
    timestamp: new Date().toISOString(),
  });
});

// GET all messages (for admin review)
app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, subject, message, created_at FROM contact_messages ORDER BY created_at DESC'
    );
    res.json({ success: true, count: rows.length, messages: rows });
  } catch (err) {
    console.error('GET /api/messages error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// POST — Contact form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate inputs
  const errors = validateContactInput({ name, email, subject, message });
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), subject.trim(), message.trim()]
    );

    console.log(`📨 New message from ${name} (${email}) — ID: ${result.insertId}`);

    res.status(201).json({
      success: true,
      message: 'Message received! I will get back to you soon.',
      id: result.insertId,
    });
  } catch (err) {
    console.error('POST /api/contact error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to save message. Please try again.' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('══════════════════════════════════════');
  console.log('   Lakshmi SB Portfolio Backend API   ');
  console.log('══════════════════════════════════════');
  console.log(`🚀  Server running on http://localhost:${PORT}`);
  console.log(`📋  Health check: http://localhost:${PORT}/`);
  console.log(`📨  Contact API:  http://localhost:${PORT}/api/contact`);
  console.log(`📂  Messages:     http://localhost:${PORT}/api/messages`);
  console.log('══════════════════════════════════════');
  console.log('');
});
