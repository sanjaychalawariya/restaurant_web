import FoodModel from "../models/foodModel.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const addFood = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image file is required" });
        }

        const image_filename = req.file.filename;

        const food = new FoodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename
        });
        
        await food.save();
        res.json({ success: true, message: "Food Added", data: food });
    } catch (error) {
        console.error("Add Food Error:", error);
        res.status(500).json({ success: false, message: "Error adding food", error: error.message });
    }
};

const listFood = async (req, res) => {
    try {
        const foods = await FoodModel.find({});
        res.json({ success: true, data: foods });
    } catch (error) {
        console.error("List Food Error:", error);
        res.status(500).json({ success: false, message: "Error fetching foods" });
    }
};

const removeFood = async (req, res) => {
    try {
        if (!req.body.id) {
            return res.status(400).json({ success: false, message: "Food ID is required" });
        }

        const food = await FoodModel.findById(req.body.id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food not found" });
        }

        // Remove image file with proper path
        const imagePath = path.join(__dirname, '../uploads', food.image);
        fs.unlink(imagePath, (err) => {
            if (err && err.code !== 'ENOENT') { // Ignore if file doesn't exist
                console.error("Error deleting file:", err);
            }
        });

        await FoodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.error("Remove Food Error:", error);
        res.status(500).json({ success: false, message: "Error deleting food" });
    }
};

export { addFood, listFood, removeFood };