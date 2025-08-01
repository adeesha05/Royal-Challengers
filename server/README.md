# Global Image Server - Database Setup

## 🗄️ Database Connection

This server uses MongoDB as the database. Follow these steps to set up the database connection:

### Option 1: Local MongoDB (Recommended for Development)

1. **Install MongoDB locally:**
   - Download from: https://www.mongodb.com/try/download/community
   - Or use Homebrew (macOS): `brew install mongodb-community`

2. **Start MongoDB service:**
   ```bash
   # macOS/Linux
   sudo systemctl start mongod
   
   # Or manually
   mongod --dbpath /data/db
   ```

3. **The server will automatically connect to:** `mongodb://localhost:27017/globalimage`

### Option 2: MongoDB Atlas (Cloud)

1. **Create a MongoDB Atlas account:**
   - Go to: https://www.mongodb.com/atlas
   - Create a free cluster

2. **Get your connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

3. **Create a .env file in the server directory:**
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/globalimage
   PORT=5050
   JWT_SECRET=your_secret_key_here
   ```

## 🚀 Starting the Server

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Test database connection:**
   ```bash
   node test-db.js
   ```

3. **Start the server:**
   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

## 🔧 Troubleshooting

### Database Connection Issues

1. **Check if MongoDB is running:**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Or try connecting manually
   mongo
   ```

2. **Test connection:**
   ```bash
   node test-db.js
   ```

3. **Common errors:**
   - `ECONNREFUSED`: MongoDB not running
   - `Authentication failed`: Wrong credentials
   - `Network timeout`: Check internet connection (for Atlas)

### Server Issues

1. **Port already in use:**
   ```bash
   # Kill process on port 5050
   lsof -ti:5050 | xargs kill -9
   ```

2. **Module not found:**
   ```bash
   npm install
   ```

## 📊 Database Collections

The server creates these collections automatically:
- `bookings` - Booking records
- `users` - User accounts
- `galleries` - Image gallery
- `services` - Service listings

## 🔐 Environment Variables

Create a `.env` file in the server directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/globalimage

# Server
PORT=5050

# Authentication
JWT_SECRET=your_super_secret_key_here

# Environment
NODE_ENV=development
```

## ✅ Verification

After setup, you should see:
```
✅ MongoDB connected successfully
Server running on port 5050
```

The admin booking interface should now work with full database functionality! 