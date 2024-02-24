import mongoose from 'mongoose';

const URI = process.env.MONGODB_URI || 'mongodb+srv://ggusain265:gaurav-132@cluster0.wccd7g1.mongodb.net/youtube';

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

export {connectDb};

