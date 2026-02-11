// routes/plantRoutes.js

const express = require('express');
const router = express.Router();
const PlantImage = require('../models/plantImage');

// Helper: normalize DB imagePath values to public URLs (mounts to /plantImages)
const normalizeImagePath = (req, imgPath) => {
  if (!imgPath) return null;
  try {
    const parsed = new URL(imgPath);
    if (parsed.protocol && (parsed.protocol.startsWith('http') || parsed.protocol.startsWith('https'))) {
      return imgPath;
    }
  } catch (e) {
    // not a full URL, continue
  }

  let normalized = String(imgPath || '').trim().replace(/\\/g, '/');

  // If it contains 'models/plantImages', map it to '/plantImages/...'
  const modelsMatch = normalized.match(/models\/plantImages\/(.*)/i);
  if (modelsMatch && modelsMatch[1]) {
    normalized = `/plantImages/${modelsMatch[1].replace(/^\/+/, '')}`;
  } else if (/^\/?plantImages(\/.*)?/i.test(normalized)) {
    normalized = `/${normalized.replace(/^\/+/, '')}`;
  } else {
    normalized = `/plantImages/${normalized.replace(/^\/+/, '')}`;
  }

  return `${req.protocol}://${req.get('host')}${normalized}`;
};

// GET /home - Fetch all plants, supports ?q=search
router.get('/home', async (req, res) => {
  try {
    const q = req.query.q;
    const filter = q ? { plantName: { $regex: q, $options: 'i' } } : {};
    const limit = q ? 50 : 10;
    const images = await PlantImage.find(filter).limit(limit).sort({ createdAt: -1 });

    // Normalize DB imagePath values to correct public URLs
    const buildImageUrl = (req, imgPath) => {
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

      // If the path contains 'models/plantImages' but has extra prefixes (like 'backend/...'), collapse it
      const m = normalized.match(/(.*models[\\/]+plantImages[\\/].*)/i);
      if (m) {
        // keep only the '/models/plantImages/...' part
        normalized = m[1].replace(/.*?(models[\\/]+plantImages[\\/].*)/i, '$1');
      }

      // If it's just a filename (no 'models/plantImages' fragment), prepend the models path
      if (!/models[\\/]+plantImages/i.test(normalized)) {
        normalized = `/models/plantImages/${normalized.replace(/^\/+/, '')}`;
      }

      // Ensure it starts with a leading slash
      if (!normalized.startsWith('/')) normalized = `/${normalized}`;

      return `${req.protocol}://${req.get('host')}${normalized}`;
    };

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

      // If it contains 'models/plantImages', map it to '/plantImages/...'
      const modelsMatch = normalized.match(/models\/plantImages\/(.*)/i);
      if (modelsMatch && modelsMatch[1]) {
        normalized = `/plantImages/${modelsMatch[1].replace(/^\/+/, '')}`;
      } else if (/^\/?plantImages(\/.*)?/i.test(normalized)) {
        // already '/plantImages/...' or 'plantImages/...'
        normalized = `/${normalized.replace(/^\/+/, '')}`;
      } else {
        // filename or other relative path
        normalized = `/plantImages/${normalized.replace(/^\/+/, '')}`;
      }

      return `${req.protocol}://${req.get('host')}${normalized}`;
    };

    const mapped = images.map((img) => ({
      id: img._id,
      image: normalizeImagePath(req, img.imagePath),
      localName: img.plantName,
      scientificName: '',
      description: '',
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
    const plant = await PlantImage.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    res.json({
      id: plant._id,
      image: normalizeImagePath(req, plant.imagePath),
      localName: plant.plantName,
      scientificName: '',
      description: '',
      createdAt: plant.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/home/plant', async (req, res) => {
  try {
    const data = req.body;
    const newPlant = new Plant(data);
    const savedPlant = await newPlant.save();
    console.log('data saved');
    res.status(201).json({ message: 'Plant saved successfully', plant: savedPlant });
  } catch (err) {
    res.status(400).json({ message: 'Error saving plant', error: err.message });
  }
});

module.exports = router;