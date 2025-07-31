const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Service = require('../models/Service');
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
      folder: 'services',
      resource_type: 'image',
      format: 'jpg',
      public_id: file.originalname.split('.')[0] + '-' + Date.now()
    };
  }
});
const upload = multer({ storage });

// POST /api/services - Add service
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { title, description, category, price } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Service image is required' });
    }
    
    if (!title || !description || !category || !price) {
      return res.status(400).json({ message: 'Title, description, category, and price are required.' });
    }
    
    const photoUrl = req.file.path;
    const service = new Service({
      title,
      description,
      category,
      price: parseFloat(price),
      photo: photoUrl
    });
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/services - Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/services/:id - Update service
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const { title, description, category, price } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    
    if (!title || !description || !category || !price) {
      return res.status(400).json({ message: 'Title, description, category, and price are required.' });
    }
    
    // Update fields
    service.title = title;
    service.description = description;
    service.category = category;
    service.price = parseFloat(price);
    
    // Handle photo update
    if (req.file) {
      service.photo = req.file.path;
    }
    
    await service.save();
    res.json(service);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// DELETE /api/services/:id - Delete service
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    
    await service.deleteOne();
    res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Service report endpoint
router.get('/report', async (req, res) => {
  try {
    const report = await Service.aggregate([
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