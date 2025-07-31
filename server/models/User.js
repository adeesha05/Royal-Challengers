const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  phone:     { type: String },
  role:      { type: String, enum: ['admin', 'staff', 'client'], default: 'client' },
  isActive:  { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  profile:   {
    address: String,
    city: String,
    country: String,
    profilePicture: String
  }
});

module.exports = mongoose.model('User', UserSchema); 