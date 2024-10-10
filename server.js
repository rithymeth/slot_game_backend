const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());

// Update CORS configuration
app.use(cors({
    origin: ['http://localhost:8080', 'https://sparkling-travesseiro-de3bef.netlify.app'],
    credentials: true
}));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/game', require('./routes/game'));

// Database Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/slot_machine';

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Listen on the appropriate port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
