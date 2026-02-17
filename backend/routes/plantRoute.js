const express = require('express');
const router = express.Router();
const Plant = require('../models/plantModel');
const upload=require("../uploadMiddleware");

// Helper: normalize DB imagePath to public URL
const normalizeImagePath = (req, imgPath) => {
  if (!imgPath) return null;

  // If already a full URL, return as-is
  try {
    const parsed = new URL(imgPath);
    if (parsed.protocol && (parsed.protocol.startsWith('http') || parsed.protocol.startsWith('https'))) {
      return imgPath;
    }
  } catch (e) {
    // not a full URL, continue
  }

  let normalized = String(imgPath || '').trim();
  // Normalize Windows backslashes
  normalized = normalized.replace(/\\/g, '/');

  // Ensure it starts with /
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }

  return `${req.protocol}://${req.get('host')}${normalized}`;
};


// GET /home - Fetch all plants from, supports ?q=search 
router.get('/home', async (req, res) => {
  try {
    const q = req.query.q;
    const filter = q ? { plantName: { $regex: q, $options: 'i' } } : {};
    const limit = q ? 50 : 10;
    const images = await Plant.find(filter).limit(limit).sort({ createdAt: -1 });

    const mapped = images.map((img) => ({
      id: img._id,
      image: normalizeImagePath(req, img.imagePath),
      localName: img.plantName,
      scientificName: img.scientificName || '',
      description: img.description || '',
      uses: img.uses || '',
      createdAt: img.createdAt,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /home/:id - fetch single plant by id
router.get('/home/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    res.json({
      id: plant._id,
      image: normalizeImagePath(req, plant.imagePath),
      localName: plant.plantName,
      scientificName: plant.scientificName || '',
      description: plant.description || '',
      uses: plant.uses || '',
      createdAt: plant.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//route to upload image
router.post('/upload-image', upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        res.status(200).json({ imageUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//route to add a new plant
router.post('/home/addPlant', async (req, res) => {
  try {
    const newPlant = new Plant({
      plantName: req.body.plantName,
      scientificName: req.body.scientificName || '',
      uses: req.body.uses || '',
      description: req.body.description || '',
      imagePath: req.body.imagePath,
    });
    
    const savedPlant = await newPlant.save();
    console.log('Plant saved with image:', savedPlant.imagePath);
    
    res.status(201).json({
      message: 'Plant saved successfully',
      plant: {
        id: savedPlant._id,
        image: normalizeImagePath(req, savedPlant.imagePath),
        localName: savedPlant.plantName,
        scientificName: savedPlant.scientificName,
        uses: savedPlant.uses,
        description: savedPlant.description,
      },
    });
  } catch (err) {
    res.status(400).json({ message: 'Error saving plant', error: err.message });
  }
});

// PATCH /home/:id - update plant name and/or description
router.patch('/home/:id', async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body.plantName === 'string') {
      updates.plantName = req.body.plantName.trim();
    }
    if (typeof req.body.scientificName === 'string') {
      updates.scientificName = req.body.scientificName.trim();
    }
    if (typeof req.body.uses === 'string') {
      updates.uses = req.body.uses;
    }
    if (typeof req.body.description === 'string') {
      updates.description = req.body.description;
    }

    const updated = await Plant.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: 'Plant not found' });

    res.json({
      id: updated._id,
      image: normalizeImagePath(req, updated.imagePath),
      localName: updated.plantName,
      scientificName: updated.scientificName || '',
      uses: updated.uses || '',
      description: updated.description || '',
      createdAt: updated.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//route to delete a plant by id
router.delete('/home/:id', async (req, res) => {
  try {
    const deleted = await Plant.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Plant not found' });
    res.json({ message: 'Plant deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;