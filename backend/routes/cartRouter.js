import express from "express";
import authModule from "../middleware/auth.js";
import { addToCart, getCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cartController.js";

const { authMiddleware, requireAuth } = authModule;

const cartRouter = express.Router();

// All cart endpoints require authenticated user context
cartRouter.use(authMiddleware);
cartRouter.use(requireAuth);

// Get current user's cart
cartRouter.get("/", getCart);

// Add item to cart
cartRouter.post("/add", addToCart);

// Update item quantity (set to specific quantity; 0 removes)
cartRouter.put("/item", updateCartItem);

// Remove a specific item
cartRouter.delete("/item", removeFromCart);

// Clear entire cart
cartRouter.delete("/clear", clearCart);

export default cartRouter;



