const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Gallery = require('../models/Gallery');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const axios = require('axios');
require('dotenv').config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'galleries',
      resource_type: 'image',
      format: 'jpg', // or keep original: file.mimetype.split('/')[1]
      public_id: file.originalname.split('.')[0] + '-' + Date.now()
    };
  }
});
const upload = multer({ storage });

// POST /api/gallery - Add gallery
router.post('/', upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'photos', maxCount: 50 }
]), async (req, res) => {
  try {
    console.log('Gallery creation request received');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    const { name, description, category } = req.body;
    
    // Validate required fields
    if (!name || !description || !category) {
      console.log('Missing required fields:', { name, description, category });
      return res.status(400).json({ message: 'Name, description, and category are required' });
    }
    
    if (!req.files.cover || !req.files.cover[0]) {
      console.log('Missing cover image');
      return res.status(400).json({ message: 'Cover image is required' });
    }
    if (!req.files.photos || req.files.photos.length === 0) {
      console.log('Missing gallery images');
      return res.status(400).json({ message: 'At least one gallery image is required' });
    }
    
    const coverUrl = req.files.cover[0].path;
    const photoUrls = req.files.photos.map(f => f.path);
    
    console.log('Cover URL:', coverUrl);
    console.log('Photo URLs:', photoUrls);
    
    const gallery = new Gallery({
      name,
      description,
      category,
      cover: coverUrl,
      photos: photoUrls
    });
    
    await gallery.save();
    console.log('Gallery saved successfully:', gallery._id);
    res.status(201).json(gallery);
  } catch (err) {
    console.error('Gallery creation error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// GET /api/gallery - Get all galleries
router.get('/', async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });
    res.json(galleries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/gallery/:id - Update gallery
router.put('/:id', upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'photos', maxCount: 50 }
]), async (req, res) => {
  try {
    const { name, description, category } = req.body;
    let keepPhotos = [];
    if (req.body.keepPhotos) {
      try {
        keepPhotos = JSON.parse(req.body.keepPhotos);
      } catch (e) {
        keepPhotos = [];
      }
    }
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: 'Gallery not found' });
    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Name, description, and category are required.' });
    }
    // Update fields
    gallery.name = name;
    gallery.description = description;
    gallery.category = category;
    // Handle cover image
    if (req.files.cover && req.files.cover[0]) {
      // Optionally: delete old cover from Cloudinary (not implemented here)
      gallery.cover = req.files.cover[0].path;
    }
    // Handle gallery images
    // Remove images not in keepPhotos
    // Optionally: delete removed images from Cloudinary (not implemented here)
    gallery.photos = keepPhotos;
    if (req.files.photos && req.files.photos.length > 0) {
      gallery.photos = gallery.photos.concat(req.files.photos.map(f => f.path));
    }
    await gallery.save();
    res.json(gallery);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// DELETE /api/gallery/:id - Delete gallery and its images
router.delete('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: 'Gallery not found' });
    // Optionally: delete images from Cloudinary (not implemented here)
    await gallery.deleteOne();
    res.json({ message: 'Gallery deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Proxy download endpoint
router.get('/download', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('No url provided');
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const filename = url.split('/').pop().split('?')[0] || 'image.jpg';
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (err) {
    res.status(500).send('Failed to download image');
  }
});

// Gallery report endpoint
router.get('/report', async (req, res) => {
  try {
    const report = await Gallery.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            category: "$category"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.category": 1 }
      }
    ]);
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

module.exports = router; 