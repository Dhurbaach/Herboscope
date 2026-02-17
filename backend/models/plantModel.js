const mongoose = require('mongoose');

const plantImageSchema = new mongoose.Schema({
  plantName: { type: String, required: true },
  scientificName: { type: String, default: '' },
  uses: { type: String, default: '' },
  description: { type: String, default: '' },
  imagePath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Plant', plantImageSchema);