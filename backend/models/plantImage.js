const mongoose = require('mongoose');

const plantImageSchema = new mongoose.Schema({
  plantName: { type: String, required: true },
  imagePath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PlantImage', plantImageSchema);