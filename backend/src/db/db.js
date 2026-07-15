import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("❤️MONGO DB CONNECTED!!");   
    } catch (error) {
        console.error("error occ ->",error);
        process.exit(1);
    }
}

export default connectDB;