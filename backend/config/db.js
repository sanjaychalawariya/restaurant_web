import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb+srv://sanjayit:Sanjay666452@cluster0.ucaucfs.mongodb.net/tecnoHub';
        await mongoose.connect(mongoURI);
        console.log("✅ DB Connected");
    } catch (error) {
        console.error("❌ DB Connection Error:", error.message);
        process.exit(1);
    }
};