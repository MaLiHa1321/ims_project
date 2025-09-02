const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: "*", // allow all for testing
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Routes
// Add this after the other middleware
app.use('/api/auth', require('./router/auth'));
// Add this after the auth routes
app.use('/api/inventories', require('./router/inventories'));
// Add other routes later
app.use('/api/admin', require('./router/admin'));
app.use('/api/items', require('./router/items'));
// backend/server.js - Add this line
app.use('/api/stats', require('./router/stats'));
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));