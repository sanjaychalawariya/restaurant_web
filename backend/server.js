import 'dotenv/config';
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

import userRouter from "./routes/userRouter.js";
import foodRouter from "./routes/foodRouter.js";
import orderRouter from "./routes/orderRouter.js";
import cartRouter from "./routes/cartRouter.js";
import { connectDB } from "./config/db.js";
import reservationRouter from "./routes/reservationRouter.js";
// import cartRouter from "./routes/cartRouter.js";
// import orderRouter from "./routes/orderRouter.js";




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
app.use('/api/reservations', reservationRouter);

// other disabled routes stay commented

connectDB();
import FoodModel from "./models/foodModel.js";
import fs from 'fs';

// Seed initial food entries if db is empty (for out-of-the-box functionality)
const seedDatabase = async () => {
    try {
        const count = await FoodModel.countDocuments();
        if (count === 0) {
            console.log("🌱 Database is empty. Seeding initial food items...");
            
            // Get available images from uploads to ensure valid image references
            const uploads = fs.existsSync(path.join(__dirname, 'uploads')) 
                ? fs.readdirSync(path.join(__dirname, 'uploads')) 
                : [];
                
            const getImage = (baseName) => {
                const found = uploads.find(file => file.includes(baseName));
                return found || baseName; // Fallback to baseName if not found (might break image link, but won't crash)
            };

            await FoodModel.insertMany([
                { name: "Wagyu Ribeye", price: 150, description: "Luxurious Wagyu Ribeye steak, Michelin-star presentation.", category: "Mains", image: getImage("luxury_dish_1.png") },
                { name: "Beluga Caviar", price: 200, description: "Stunning Beluga Caviar appetizer on a delicate mother-of-pearl spoon.", category: "Appetizers", image: getImage("luxury_dish_2.png") },
                { name: "Truffle Risotto", price: 85, description: "Creamy Truffle Risotto with shaved black truffles.", category: "Mains", image: getImage("luxury_dish_3.png") },
                { name: "Gold Leaf Chocolate", price: 45, description: "Elegant gold leaf chocolate dome dessert.", category: "Deserts", image: getImage("luxury_dish_4.png") }
            ]);
            console.log("✅ Seeding complete! Database is now functional with luxury menu.");
        }
        
        // Ensure all existing foods are marked available on startup
        await FoodModel.updateMany({ isAvailable: { $ne: true } }, { $set: { isAvailable: true } });
        console.log('Food availability normalized.');
    } catch (err) {
        console.log('Database init/seeding error:', err.message);
    }
};

seedDatabase();
app.get("/",(req,res)=>{
    res.send("API WORKING")
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});