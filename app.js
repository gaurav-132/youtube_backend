import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { authRoutes } from './routes/authRoutes.js';
import { youtubeRoutes } from './routes/youtubeRoutes.js';


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}));

app.use(express.json({ limit : '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'))
app.use(cookieParser());

//routes import
import userRouter from './routes/user.routes.js';




//routes declaration
app.use("/api/v1/users", userRouter);


app.use('/api/auth', authRoutes);
app.use('/api/youtube', youtubeRoutes);

export { app };