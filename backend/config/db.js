import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://sanjayit:Sanjay666452@cluster0.ucaucfs.mongodb.net/tecnoHub').then(()=>console.log("DB Connected"));
}