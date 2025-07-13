// models/Plant.js

const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  localName: {
    type: String,
    required: true,
    trim: true,
  },
  scientificName: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  partsUsed: {
    type: [String], // e.g., ['leaves', 'roots']
    required: false,
  },
  type: {
    type: String, // e.g., 'herb', 'shrub', 'tree'
    required: false,
    enum: ['herb', 'shrub', 'tree', 'vine', 'grass'], // Optional: restrict values
  },
});

module.exports = mongoose.model('Plant', plantSchema);
