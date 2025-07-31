const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
app.use(express.json());

// Allow requests from both localhost:3000 and localhost:3002
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Auth routes
app.use('/api/auth', require('./routes/auth'));
// Gallery routes
app.use('/api/gallery', require('./routes/gallery'));
// Services routes
app.use('/api/services', require('./routes/services'));
// Serve uploaded images statically
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Global Image API is running');
});

// Change port from 5000 to 5050 to avoid macOS system port conflict
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 