// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: ['https://1331slot.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    credentials: true
}));

app.options('*', cors()); // Include before other routes

app.use(express.json());

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
