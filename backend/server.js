// backend/server.js
const express = require('express');
const app = express();
const PORT = 3000;

// Connect to MongoDB
const connectDB = require('./db');
connectDB();

const plantRoutes = require('./routes/plantRoute');

app.use(express.json());
app.use('/', plantRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
