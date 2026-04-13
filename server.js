require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./backend/config/db');
const path = require('path');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/categories', require('./backend/routes/categories'));
app.use('/api/providers', require('./backend/routes/providers'));
app.use('/api/slots', require('./backend/routes/slots'));
app.use('/api/appointments', require('./backend/routes/appointments'));
app.use('/api/feedback', require('./backend/routes/feedback'));
app.use('/api/stats', require('./backend/routes/stats'));

// Health check
app.get('/api', (req, res) => res.json({ message: '✅ AppointEase API is running!' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

//app.get('*', (req, res) => {
//  res.sendFile(path.join(__dirname, 'index.html'));
//});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
