const express = require('express');
const router = express.Router();
const Plant = require('../models/plantModel');
const upload=require("../uploadMiddleware");
const fetch = require('node-fetch');
const FormData = require('form-data');
const multer = require('multer');
const axios = require('axios');

const uploadIdentify=multer();

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

//route to call plantnet api for plant recognition
router.post('/identify', uploadIdentify.single("image"), async (req, res) => {
  try {
    const organ = req.body.organ || "auto";
    if (!req.file) {
      return res.status(400).json({ message: 'Image and organ are required' });
    }

    // Call PlantNet API
    const formData = new FormData();
    formData.append('organs', organ);
    formData.append('images', req.file.buffer, req.file.originalname);

    const response = await fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_API_KEY}`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`PlantNet API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('PlantNet response:', data);
    res.json(data);
  } catch (err) {
    console.error('Error identifying plant:', err);
    res.status(500).json({ message: 'Error identifying plant', error: err.message });
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

// GET /search-images - Search for similar plant images from Wikimedia Commons
router.get('/search-images', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const headers = {
      'User-Agent': 'Herboscope-App (https://github.com/herboscope)'
    };

    // Search Wikimedia Commons for plant images
    const response = await axios.get('https://commons.wikimedia.org/w/api.php', {
      params: {
        action: 'query',
        list: 'search',
        srsearch: query,
        srnamespace: 6, // File namespace
        format: 'json',
        srlimit: 20
      },
      headers,
      timeout: 15000
    });

    const searchResults = response.data.query.search || [];
    
    // Fetch image details in parallel using Promise.all
    const imageDetailsFetches = searchResults.slice(0, 12).map(result =>
      axios.get('https://commons.wikimedia.org/w/api.php', {
        params: {
          action: 'query',
          titles: result.title,
          prop: 'imageinfo',
          iiprop: 'url|size|mime',
          format: 'json'
        },
        headers,
        timeout: 10000
      })
        .then(fileResponse => {
          const pages = fileResponse.data.query.pages;
          const page = Object.values(pages)[0];
          
          if (page.imageinfo && page.imageinfo[0]) {
            const imgInfo = page.imageinfo[0];
            if (imgInfo.mime && imgInfo.mime.startsWith('image/')) {
              return {
                url: imgInfo.url,
                title: result.title,
                source: 'Wikimedia Commons',
                width: imgInfo.width,
                height: imgInfo.height
              };
            }
          }
          return null;
        })
        .catch(error => {
          console.error(`Failed to get details for ${result.title}:`, error.message);
          return null;
        })
    );

    const imageDetails = (await Promise.all(imageDetailsFetches))
      .filter(img => img !== null)
      .slice(0, 12);

    res.json({ results: imageDetails });
  } catch (err) {
    console.error('Image search error:', err.message);
    res.status(500).json({ message: 'Failed to search for images', error: err.message });
  }
});

module.exports = router;