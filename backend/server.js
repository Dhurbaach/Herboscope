// backend/server.js
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const path=require('path');
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect to MongoDB
const connectDB = require('./db');
connectDB();

const fs = require('fs');

// Apply CORS early so static responses (images) include proper CORS headers for cross-origin frontends
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like server-to-server or mobile clients)
    if (!origin) return callback(null, true);
    const allowedOrigins = [CLIENT_URL];
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy does not allow access from the specified Origin.'), false);
  },
  credentials: true,
  // Ensure Authorization header is allowed in CORS preflight
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
}));

// Serve uploads folder statically (after CORS middleware)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));


const plantRoutes = require('./routes/plantRoute');
const userRoutes = require('./routes/userRoute');


app.use(express.json());
app.use('/', plantRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
