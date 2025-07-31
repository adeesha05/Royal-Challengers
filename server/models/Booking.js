const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  clientName: { 
    type: String, 
    required: true 
  },
  clientEmail: { 
    type: String, 
    required: true 
  },
  clientPhone: { 
    type: String 
  },
  eventType: { 
    type: String, 
    required: true 
  },
  eventDate: { 
    type: Date, 
    required: true 
  },
  eventTime: { 
    type: String 
  },
  eventLocation: { 
    type: String 
  },
  eventDuration: { 
    type: Number 
  },
  description: { 
    type: String 
  },
  assignedStaff: [{
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    role: String,
    hours: Number
  }],
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  totalCost: { 
    type: Number, 
    default: 0 
  },
  deposit: { 
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

module.exports = mongoose.model('Booking', BookingSchema); 