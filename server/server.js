require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const photoRoutes = require('./routes/photoRoutes');
const statsController = require('./controllers/statsController');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const { PORT = 5000, MONGODB_URI, JWT_SECRET } = process.env;

if (!MONGODB_URI || !JWT_SECRET) {
  console.error('MONGODB_URI and JWT_SECRET are required. Copy server/.env.example to server/.env and fill them in.');
  process.exit(1);
}
if (JWT_SECRET.length < 32) {
  console.warn('Warning: JWT_SECRET is short. Use at least 32 random characters.');
}

const app = express();

// ---------- Global middleware ----------
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- Health check ----------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

// ---------- API routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.get('/api/stats', statsController.getStats);

// ---------- Error handling (must stay last) ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start: connect to the database first, then listen ----------
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
