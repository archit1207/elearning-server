import mongoose from "mongoose";

export const connectDB = async() => {
    try {
        await mongoose.connect(process.env.DB);
        console.log("database connected");
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}