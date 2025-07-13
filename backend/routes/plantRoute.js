// routes/plantRoutes.js

const express = require('express');
const router = express.Router();
const Plant = require('../models/plantModel');

// GET /home/plant - Fetch all plants
router.get('/home/plant', async (req, res) => {
  try {
    const plants = await Plant.find();
    
    res.json(plants).json({ message: 'Plants fetched successfully', plants });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching plants', error: err.message });
  }
});

router.post('/home/plant', async (req, res) => {
  try {
    const data = req.body;
    const newPlant=new Plant(data);
    const savedPlant = await newPlant.save();
     console.log('data saved');
    res.status(201).json({ message: 'Plant saved successfully', plant: savedPlant });
  } catch (err) {
    res.status(400).json({ message: 'Error saving plant', error: err.message });
  }
});

module.exports = router;