import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

import userRouter from "./routes/userRouter.js";
import foodRouter from "./routes/foodRouter.js";
import orderRouter from "./routes/orderRouter.js";
import cartRouter from "./routes/cartRouter.js";
import { connectDB } from "./config/db.js";
// import cartRouter from "./routes/cartRouter.js";
// import orderRouter from "./routes/orderRouter.js";

import dotenv from 'dotenv';
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ✅ Serve static files from uploads directory
app.use("/images", express.static(path.join(__dirname, "uploads")));

// Your other routes
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use('/api/orders', orderRouter);
app.use('/api/cart', cartRouter);

// other disabled routes stay commented

connectDB();
// Ensure all existing foods are marked available on startup
import FoodModel from "./models/foodModel.js";
FoodModel.updateMany({ isAvailable: { $ne: true } }, { $set: { isAvailable: true } })
  .then((res) => console.log(`Food availability normalized: matched=${res.matchedCount || res.n} modified=${res.modifiedCount || res.nModified}`))
  .catch((err) => console.log('Food availability update error:', err.message));
app.get("/",(req,res)=>{
    res.send("API WORKING")
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});