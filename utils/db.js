const mongoose = require('mongoose');

const URI = process.env.MONGO_URI;

const connectDb = async () => {
    try{
        if (!URI) {
            throw new Error('MONGO_URI is not defined in the environment variables.');
        }

        await mongoose.connect(URI);

        console.log(`Database Connected Successfully`);
    }catch(error){
        console.log(`Database connection failed ${error.message}`);
        process.exit(0);
    }
}

module.exports = connectDb;

