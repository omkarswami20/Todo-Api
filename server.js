const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const authService = require('./services/auth-service/index');

dotenv.config();

const app = express();
app.use(express.json());

connectDB();

// Routes
app.use('/api', authService);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Todo API chal rahi hai!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server chal raha hai port ${PORT} pe`);
});