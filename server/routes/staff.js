const express = require('express');
const multer = require('multer');
const path = require('path');
const Staff = require('../models/Staff');
const Booking = require('../models/Booking');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware to check if user is admin (you can enhance this based on your auth system)
const isAdmin = (req, res, next) => {
  // For now, we'll assume any authenticated user can access staff management
  // You can enhance this to check for admin role
  next();
};

// Get all staff
router.get('/', isAdmin, async (req, res) => {
  try {
    console.log('Fetching all staff...');
    const staff = await Staff.find().sort({ createdAt: -1 });
    console.log('Found staff:', staff.length, 'members');
    res.json(staff);
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single staff member
router.get('/:id', isAdmin, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new staff member
router.post('/', isAdmin, upload.single('photo'), async (req, res) => {
  try {
    console.log('Adding new staff member...');
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    
    const { name, title, email, phone, description, hourlyRate, specializations } = req.body;
    
    // Check if email already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Handle photo upload
    let photoPath = '';
    if (req.file) {
      photoPath = `/uploads/${req.file.filename}`;
    }

    const staff = new Staff({
      name,
      title,
      email,
      phone,
      photo: photoPath,
      description,
      hourlyRate: parseFloat(hourlyRate) || 0,
      specializations: specializations ? (Array.isArray(specializations) ? specializations : [specializations]) : []
    });

    console.log('Saving staff member:', staff);
    await staff.save();
    console.log('Staff member saved successfully');
    res.status(201).json(staff);
  } catch (err) {
    console.error('Error adding staff:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Update staff member
router.put('/:id', isAdmin, upload.single('photo'), async (req, res) => {
  try {
    const { name, title, email, phone, description, hourlyRate, specializations, isActive } = req.body;
    
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    // Check if email is being changed and if it already exists
    if (email !== staff.email) {
      const existingStaff = await Staff.findOne({ email });
      if (existingStaff) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Handle photo upload
    if (req.file) {
      staff.photo = `/uploads/${req.file.filename}`;
    }

    staff.name = name || staff.name;
    staff.title = title || staff.title;
    staff.email = email || staff.email;
    staff.phone = phone || staff.phone;
    staff.description = description || staff.description;
    staff.hourlyRate = hourlyRate !== undefined ? parseFloat(hourlyRate) : staff.hourlyRate;
    staff.specializations = specializations ? (Array.isArray(specializations) ? specializations : [specializations]) : staff.specializations;
    staff.isActive = isActive !== undefined ? isActive : staff.isActive;
    staff.updatedAt = Date.now();

    await staff.save();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete staff member
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    // Check if staff has any active bookings
    const activeBookings = await Booking.find({
      'assignedStaff.staffId': req.params.id,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete staff with active bookings. Please reassign or cancel bookings first.' 
      });
    }

    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update staff availability
router.put('/:id/availability', isAdmin, async (req, res) => {
  try {
    const { availability } = req.body;
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    staff.availability = { ...staff.availability, ...availability };
    staff.updatedAt = Date.now();
    await staff.save();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign staff to booking
router.post('/:id/assign', isAdmin, async (req, res) => {
  try {
    const { bookingId, role, hours } = req.body;
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Check if staff is already assigned to this booking
    const alreadyAssigned = booking.assignedStaff.find(
      assignment => assignment.staffId.toString() === req.params.id
    );
    if (alreadyAssigned) {
      return res.status(400).json({ message: 'Staff already assigned to this booking' });
    }

    // Add staff to booking
    booking.assignedStaff.push({
      staffId: req.params.id,
      role,
      hours
    });
    await booking.save();

    // Add booking to staff's assigned bookings
    staff.assignedBookings.push({
      bookingId,
      eventDate: booking.eventDate,
      eventType: booking.eventType,
      status: 'assigned'
    });
    staff.totalEvents += 1;
    staff.updatedAt = Date.now();
    await staff.save();

    res.json({ message: 'Staff assigned successfully', booking, staff });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove staff from booking
router.delete('/:id/assign/:bookingId', isAdmin, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Remove staff from booking
    booking.assignedStaff = booking.assignedStaff.filter(
      assignment => assignment.staffId.toString() !== req.params.id
    );
    await booking.save();

    // Remove booking from staff's assigned bookings
    staff.assignedBookings = staff.assignedBookings.filter(
      assignment => assignment.bookingId.toString() !== req.params.bookingId
    );
    staff.updatedAt = Date.now();
    await staff.save();

    res.json({ message: 'Staff removed from booking successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get staff report
router.get('/:id/report', isAdmin, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const { startDate, endDate } = req.query;
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        eventDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const bookings = await Booking.find({
      'assignedStaff.staffId': req.params.id,
      ...dateFilter
    }).populate('assignedStaff.staffId', 'name title');

    const report = {
      staff: {
        name: staff.name,
        title: staff.title,
        email: staff.email,
        totalEvents: staff.totalEvents,
        rating: staff.rating,
        isActive: staff.isActive
      },
      bookings: bookings,
      totalBookings: bookings.length,
      totalHours: bookings.reduce((sum, booking) => {
        const assignment = booking.assignedStaff.find(
          a => a.staffId._id.toString() === req.params.id
        );
        return sum + (assignment ? assignment.hours : 0);
      }, 0),
      totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalCost, 0)
    };

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all staff report
router.get('/reports/summary', isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        eventDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const allStaff = await Staff.find();
    const allBookings = await Booking.find(dateFilter).populate('assignedStaff.staffId', 'name title');

    const summary = {
      totalStaff: allStaff.length,
      activeStaff: allStaff.filter(s => s.isActive).length,
      totalBookings: allBookings.length,
      totalRevenue: allBookings.reduce((sum, booking) => sum + booking.totalCost, 0),
      staffStats: allStaff.map(staff => {
        const staffBookings = allBookings.filter(booking =>
          booking.assignedStaff.some(assignment => 
            assignment.staffId._id.toString() === staff._id.toString()
          )
        );
        
        return {
          id: staff._id,
          name: staff.name,
          title: staff.title,
          totalBookings: staffBookings.length,
          totalHours: staffBookings.reduce((sum, booking) => {
            const assignment = booking.assignedStaff.find(
              a => a.staffId._id.toString() === staff._id.toString()
            );
            return sum + (assignment ? assignment.hours : 0);
          }, 0),
          totalRevenue: staffBookings.reduce((sum, booking) => sum + booking.totalCost, 0),
          isActive: staff.isActive
        };
      })
    };

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 