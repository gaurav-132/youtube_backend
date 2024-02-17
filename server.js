const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const contactRoutes = require('./routes/contactRouter');
const authRoutes = require('./routes/authRoutes');
const youtubeRoutes = require('./routes/youtubeRoutes');
const connectDb = require('./utils/db');
const errorMiddleware = require('./middlewares/errorMiddleware');
const cors = require('cors');

const app = express();



app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/form', contactRoutes);
app.use('/api/youtube', youtubeRoutes);



app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started successfully on ${PORT}`);
    });
});
