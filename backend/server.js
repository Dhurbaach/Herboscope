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

// Prefer serving images from backend/models/plantImages if present (your DB stores paths like '/plantImages/xxx')
const plantImagesDir = path.join(__dirname, 'plantImages');
const modelsPlantImagesDir = path.join(__dirname, 'models', 'plantImages');

// Create a fallback folder only when models folder isn't present
if (!fs.existsSync(modelsPlantImagesDir) && !fs.existsSync(plantImagesDir)) {
  fs.mkdirSync(plantImagesDir, { recursive: true });
}

// Mount /plantImages to the actual image directory so DB-stored paths like '/plantImages/...' resolve correctly
const imagesMountDir = fs.existsSync(modelsPlantImagesDir) ? modelsPlantImagesDir : plantImagesDir;
app.use('/plantImages', express.static(imagesMountDir));

// Also keep the explicit /models/plantImages route for direct access when the models folder exists
if (fs.existsSync(modelsPlantImagesDir)) {
  app.use('/models/plantImages', express.static(modelsPlantImagesDir));
}

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
