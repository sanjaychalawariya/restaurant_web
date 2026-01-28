import userModel from "../models/userModel.js";

const addToCart = async (req, res) => {
    const { itemId, quantity = 1 } = req.body;
    const userId = req.user.id; // Assuming you have user info from authentication middleware

    try {
        // Validate input
        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "Item ID is required"
            });
        }

        if (typeof quantity !== 'number' || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive number"
            });
        }

        // Find user and their cart
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Initialize cartData if it doesn't exist
        if (!user.cartData) {
            user.cartData = {};
        }

        // Convert itemId to string for consistent key comparison
        const itemIdStr = itemId.toString();

        // Add or update item in cart
        if (user.cartData[itemIdStr]) {
            // Item already exists, update quantity
            user.cartData[itemIdStr] += quantity;
        } else {
            // New item, add to cart
            user.cartData[itemIdStr] = quantity;
        }

        // Ensure cartData is marked as modified
        user.markModified('cartData');

        // Save the updated user
        await user.save();

        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            cartData: user.cartData,
            updatedItem: {
                itemId: itemIdStr,
                quantity: user.cartData[itemIdStr]
            }
        });

    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Additional cart-related functions:

const getCart = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            cartData: user.cartData || {}
        });

    } catch (error) {
        console.error("Get cart error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const updateCartItem = async (req, res) => {
    const { itemId, quantity } = req.body;
    const userId = req.user.id;

    try {
        // Validate input
        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "Item ID is required"
            });
        }

        if (typeof quantity !== 'number' || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a non-negative number"
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Initialize cartData if it doesn't exist
        if (!user.cartData) {
            user.cartData = {};
        }

        const itemIdStr = itemId.toString();

        if (quantity === 0) {
            // Remove item if quantity is 0
            delete user.cartData[itemIdStr];
        } else {
            // Update quantity
            user.cartData[itemIdStr] = quantity;
        }

        user.markModified('cartData');
        await user.save();

        res.status(200).json({
            success: true,
            message: quantity === 0 ? "Item removed from cart" : "Cart item updated successfully",
            cartData: user.cartData
        });

    } catch (error) {
        console.error("Update cart error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const removeFromCart = async (req, res) => {
    const { itemId } = req.body;
    const userId = req.user.id;

    try {
        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "Item ID is required"
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const itemIdStr = itemId.toString();

        if (user.cartData && user.cartData[itemIdStr]) {
            delete user.cartData[itemIdStr];
            user.markModified('cartData');
            await user.save();

            res.status(200).json({
                success: true,
                message: "Item removed from cart successfully",
                cartData: user.cartData
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

    } catch (error) {
        console.error("Remove from cart error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const clearCart = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.cartData = {};
        user.markModified('cartData');
        await user.save();

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cartData: user.cartData
        });

    } catch (error) {
        console.error("Clear cart error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export { 
    addToCart, 
    getCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart 
};