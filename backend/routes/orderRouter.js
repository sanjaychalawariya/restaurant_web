import express from "express";
import {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    completeOrder,
    getAllOrders,
    getOrdersByStatus,
    testOrders
} from "../controllers/orderController.js";
import authModule from "../middleware/auth.js";

const { authMiddleware } = authModule;

const orderRouter = express.Router();

// Public test endpoint
orderRouter.get("/test", testOrders);

// Create order (public - allows guest orders)
orderRouter.post("/", createOrder);

// Protected routes (require authentication)
orderRouter.use(authMiddleware);

// User order routes (require authentication)
orderRouter.get("/my-orders", getUserOrders);
orderRouter.get("/:id", getOrderById);
orderRouter.put("/:id/cancel", cancelOrder);

// Formerly admin-only routes (security removed per request)
orderRouter.get("/", getAllOrders);
orderRouter.put("/:id/status", updateOrderStatus);
orderRouter.put("/:id/complete", completeOrder);
orderRouter.get("/status/:status", getOrdersByStatus);

export default orderRouter;


