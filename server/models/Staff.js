const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phone: { 
    type: String 
  },
  photo: { 
    type: String 
  },
  description: { 
    type: String 
  },
  availability: {
    monday: { type: Boolean, default: true },
    tuesday: { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday: { type: Boolean, default: true },
    friday: { type: Boolean, default: true },
    saturday: { type: Boolean, default: true },
    sunday: { type: Boolean, default: true }
  },
  hourlyRate: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  specializations: [{ 
    type: String 
  }],
  assignedBookings: [{
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    eventDate: Date,
    eventType: String,
    status: { type: String, enum: ['assigned', 'completed', 'cancelled'], default: 'assigned' }
  }],
  totalEvents: { 
    type: Number, 
    default: 0 
  },
  rating: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Staff', StaffSchema); 