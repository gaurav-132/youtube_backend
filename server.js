import dotenv from 'dotenv';
import { app } from './app.js';
import { connectDb } from './db/db.js';
dotenv.config({
    path: './.env'
});


// const errorMiddleware = require('./middlewares/errorMiddleware');


// app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started successfully on ${PORT}`);
    });
}).catch((error) => {
    console.log("Connection Failed", error);
});

