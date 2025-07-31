const express = require('express');
const Booking = require('../models/Booking');
const Staff = require('../models/Staff');
const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  // For now, we'll assume any authenticated user can access booking management
  // You can enhance this to check for admin role
  next();
};

// Get all bookings
router.get('/', isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('assignedStaff.staffId', 'name title email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single booking
router.get('/:id', isAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('assignedStaff.staffId', 'name title email phone');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new booking
router.post('/', isAdmin, async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      eventType,
      eventDate,
      eventTime,
      eventLocation,
      eventDuration,
      description,
      totalCost,
      deposit
    } = req.body;

    const booking = new Booking({
      clientName,
      clientEmail,
      clientPhone,
      eventType,
      eventDate,
      eventTime,
      eventLocation,
      eventDuration,
      description,
      totalCost,
      deposit
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const updateFields = [
      'clientName', 'clientEmail', 'clientPhone', 'eventType', 'eventDate',
      'eventTime', 'eventLocation', 'eventDuration', 'description', 'status',
      'totalCost', 'deposit'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        booking[field] = req.body[field];
      }
    });

    booking.updatedAt = Date.now();
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete booking
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Remove booking from all assigned staff
    for (const assignment of booking.assignedStaff) {
      const staff = await Staff.findById(assignment.staffId);
      if (staff) {
        staff.assignedBookings = staff.assignedBookings.filter(
          b => b.bookingId.toString() !== req.params.id
        );
        await staff.save();
      }
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available staff for a booking
router.get('/:id/available-staff', isAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const eventDate = new Date(booking.eventDate);
    const dayOfWeek = eventDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

    // Find staff available on the event date
    const availableStaff = await Staff.find({
      isActive: true,
      [`availability.${dayOfWeek}`]: true
    });

    // Filter out staff already assigned to this booking
    const assignedStaffIds = booking.assignedStaff.map(a => a.staffId.toString());
    const unassignedStaff = availableStaff.filter(
      staff => !assignedStaffIds.includes(staff._id.toString())
    );

    res.json(unassignedStaff);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking statistics
router.get('/stats/summary', isAdmin, async (req, res) => {
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

    const bookings = await Booking.find(dateFilter);
    
    const stats = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalCost, 0),
      totalDeposits: bookings.reduce((sum, booking) => sum + booking.deposit, 0),
      bookingsByStatus: {
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        'in-progress': bookings.filter(b => b.status === 'in-progress').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length
      },
      bookingsByType: bookings.reduce((acc, booking) => {
        acc[booking.eventType] = (acc[booking.eventType] || 0) + 1;
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 