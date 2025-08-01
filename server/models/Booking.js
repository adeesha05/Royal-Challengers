const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
    match: [/^[0-9+\-\s()]{10,15}$/, 'Please enter a valid contact number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    min: [new Date(), 'Date cannot be in the past']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest is required'],
    max: [1000, 'Maximum 1000 guests allowed']
  },
  photographers: {
    type: Number,
    required: [true, 'Number of photographers is required'],
    min: [1, 'At least 1 photographer is required'],
    max: [10, 'Maximum 10 photographers allowed']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true,
    maxlength: [200, 'Venue cannot exceed 200 characters']
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: {
      values: ['Wedding', 'Birthday', 'Corporate', 'Graduation', 'Engagement', 'Other'],
      message: 'Please select a valid event type'
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted date
bookingSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for duration
bookingSchema.virtual('duration').get(function() {
  if (!this.startTime || !this.endTime) return null;
  
  const start = new Date(`2000-01-01T${this.startTime}`);
  const end = new Date(`2000-01-01T${this.endTime}`);
  const diffMs = end - start;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${diffHrs}h ${diffMins}m`;
});

// Pre-save middleware to ensure proper data types
bookingSchema.pre('save', function(next) {
  // Ensure guests is a number
  if (this.guests !== undefined && this.guests !== null) {
    this.guests = Number(this.guests);
  }
  
  // Ensure photographers is a number
  if (this.photographers !== undefined && this.photographers !== null) {
    this.photographers = Number(this.photographers);
  }
  
  // Ensure totalAmount is a number
  if (this.totalAmount !== undefined && this.totalAmount !== null) {
    this.totalAmount = Number(this.totalAmount);
  }
  
  next();
});

// Pre-update middleware for findOneAndUpdate and findByIdAndUpdate
bookingSchema.pre(['updateOne', 'findOneAndUpdate', 'findByIdAndUpdate'], function(next) {
  const update = this.getUpdate();
  
  if (update.guests !== undefined && update.guests !== null) {
    update.guests = Number(update.guests);
  }
  
  if (update.photographers !== undefined && update.photographers !== null) {
    update.photographers = Number(update.photographers);
  }
  
  if (update.totalAmount !== undefined && update.totalAmount !== null) {
    update.totalAmount = Number(update.totalAmount);
  }
  
  next();
});

// Index for better query performance
bookingSchema.index({ date: 1, status: 1 });
bookingSchema.index({ email: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema); 