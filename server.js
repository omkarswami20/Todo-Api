const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { setupSwagger } = require('./config/swagger');
const authService = require('./services/auth-service/index');

dotenv.config();

const app = express();
app.use(express.json());

connectDB();
setupSwagger(app);

app.use('/api', authService);

app.get('/', (req, res) => {
    res.json({ message: 'Todo API chal rahi hai!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server chal raha hai port ${PORT} pe`);
});