import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            console.error("❌ MONGO_URI is not defined in the environment variables.");
            process.exit(1);
        }
        await mongoose.connect(mongoURI);
        console.log("✅ DB Connected");
    } catch (error) {
        console.error("❌ DB Connection Error:", error.message);
        process.exit(1);
    }
};