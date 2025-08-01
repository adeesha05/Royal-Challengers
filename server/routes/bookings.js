const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Get all bookings with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, status, eventType, month, year } = req.query;
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by event type
    if (eventType && eventType !== 'all') {
      query.eventType = eventType;
    }

    // Filter by month and year
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (month) {
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, parseInt(month) - 1, 1);
      const endDate = new Date(currentYear, parseInt(month), 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Get a single booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    console.log('📝 Received booking data:', {
      guests: req.body.guests,
      guestsType: typeof req.body.guests,
      photographers: req.body.photographers,
      photographersType: typeof req.body.photographers
    });
    
    const booking = new Booking(req.body);
    await booking.save();
    
    console.log('✅ Saved booking data:', {
      guests: booking.guests,
      guestsType: typeof booking.guests,
      photographers: booking.photographers,
      photographersType: typeof booking.photographers
    });
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    res.status(400).json({ message: 'Error creating booking', error: error.message });
  }
});

// Update a booking
router.put('/:id', async (req, res) => {
  try {
    console.log('📝 Updating booking data:', {
      guests: req.body.guests,
      guestsType: typeof req.body.guests,
      photographers: req.body.photographers,
      photographersType: typeof req.body.photographers
    });
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    console.log('✅ Updated booking data:', {
      guests: booking.guests,
      guestsType: typeof booking.guests,
      photographers: booking.photographers,
      photographersType: typeof booking.photographers
    });
    
    res.json(booking);
  } catch (error) {
    console.error('❌ Error updating booking:', error);
    res.status(400).json({ message: 'Error updating booking', error: error.message });
  }
});

// Delete a booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
});

// Get booking statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const completedBookings = await Booking.countDocuments({ status: 'Completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });

    // Calculate total revenue
    const revenueData = await Booking.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Monthly statistics for current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Booking.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31, 23, 59, 59)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing months with zero values
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyStats.find(stat => stat._id === i + 1);
      return {
        month: i + 1,
        count: monthData ? monthData.count : 0,
        revenue: monthData ? monthData.revenue : 0
      };
    });

    res.json({
      totalBookings,
      confirmedBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      monthlyStats: monthlyData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

// Get bookings by date range
router.get('/range/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings by date range', error: error.message });
  }
});

// Get bookings by event type
router.get('/event-type/:eventType', async (req, res) => {
  try {
    const bookings = await Booking.find({ eventType: req.params.eventType }).sort({ date: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings by event type', error: error.message });
  }
});

module.exports = router; 