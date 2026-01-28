import Order from "../models/orderModel.js";
import Food from "../models/foodModel.js";

// Create new order (for both authenticated users and guests)
const createOrder = async (req, res) => {
    try {
        const { 
            items, 
            orderType = 'dine-in', 
            tableNo, 
            deliveryAddress, 
            contactInfo, 
            paymentMethod = 'cash_on_delivery',
            orderNotes 
        } = req.body;
        
        // userId is optional (for guest orders)
        const userId = req.user?.id || null;

        console.log('Creating order with data:', {
            userId,
            itemsCount: items?.length,
            orderType,
            tableNo,
            paymentMethod
        });

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order items are required"
            });
        }

        // Validate order type specific fields
        if (orderType === 'dine-in' && !tableNo) {
            return res.status(400).json({
                success: false,
                message: "Table number is required for dine-in orders"
            });
        }

        if (orderType === 'delivery') {
            if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city) {
                return res.status(400).json({
                    success: false,
                    message: "Delivery address is required"
                });
            }
            if (!contactInfo || !contactInfo.phone) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number is required for delivery"
                });
            }
        }

        // Calculate total amount and validate items
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const food = await Food.findById(item.foodId);
            if (!food) {
                return res.status(400).json({
                    success: false,
                    message: `Food item with ID ${item.foodId} not found`
                });
            }

            if (!food.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: `${food.name} is currently unavailable`
                });
            }

            const itemTotal = food.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                foodId: food._id,
                name: food.name,
                price: food.price,
                quantity: item.quantity,
                image: food.image
            });
        }

        // Calculate additional charges
        const deliveryFee = orderType === 'delivery' ? 5 : 0;
        const taxAmount = totalAmount * 0.1; // 10% tax
        const finalAmount = totalAmount + deliveryFee + taxAmount;

        // Create order
        const order = new Order({
            userId,
            items: orderItems,
            totalAmount,
            deliveryFee,
            taxAmount,
            finalAmount,
            orderType,
            ...(orderType === 'dine-in' && { tableNo }),
            ...(orderType === 'delivery' && { 
                deliveryAddress,
                contactInfo 
            }),
            paymentMethod,
            orderNotes,
            paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending'
        });

        await order.save();
        
        // Populate the order for response
        const populatedOrder = await Order.findById(order._id)
            .populate('items.foodId', 'name price image')
            .populate('userId', 'username email');

        console.log('Order created successfully:', order._id);

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: populatedOrder
        });

    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get user orders (requires authentication)
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;
        
        const query = { userId };
        if (status && status !== 'all') {
            query.orderStatus = status;
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('items.foodId', 'name price image')
            .populate('userId', 'username email');

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error("Get user orders error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'username email')
            .populate('items.foodId', 'name price image category');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check if user owns the order or is admin
        if (order.userId && order.userId._id.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Get order error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check if user owns the order or is admin
        if (order.userId && order.userId.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Check if order can be cancelled
        if (!order.canBeCancelled()) {
            return res.status(400).json({
                success: false,
                message: "Order cannot be cancelled at this stage"
            });
        }

        order.orderStatus = 'cancelled';
        await order.save();

        res.json({
            success: true,
            message: "Order cancelled successfully",
            order
        });
    } catch (error) {
        console.error("Cancel order error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus: status },
            { new: true }
        ).populate('userId', 'username email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            message: "Order status updated successfully",
            order
        });
    } catch (error) {
        console.error("Update order status error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, orderType } = req.query;
        
        const query = {};
        if (status && status !== 'all') query.orderStatus = status;
        if (orderType && orderType !== 'all') query.orderType = orderType;

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('userId', 'username email')
            .populate('items.foodId', 'name price');

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error("Get all orders error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get orders by status (Admin only)
const getOrdersByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const orders = await Order.find({ orderStatus: status })
            .sort({ createdAt: -1 })
            .populate('userId', 'username email')
            .populate('items.foodId', 'name price');

        res.json({
            success: true,
            orders,
            count: orders.length
        });
    } catch (error) {
        console.error("Get orders by status error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Complete order (Admin only)
const completeOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (!order.canBeCompleted()) {
            return res.status(400).json({
                success: false,
                message: "Order cannot be completed at this stage"
            });
        }

        order.orderStatus = 'delivered';

        // Optionally complete payment if requested or if non-COD
        const shouldCompletePayment = req.body?.completePayment === true || order.paymentMethod !== 'cash_on_delivery';
        if (shouldCompletePayment) {
            order.paymentStatus = 'completed';
        }

        await order.save();

        const populated = await Order.findById(order._id)
            .populate('userId', 'username email')
            .populate('items.foodId', 'name price image');

        res.json({
            success: true,
            message: "Order marked as delivered",
            order: populated
        });
    } catch (error) {
        console.error("Complete order error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Test endpoint to check if orders API is working
const testOrders = async (req, res) => {
    res.json({
        success: true,
        message: "Orders API is working!",
        timestamp: new Date().toISOString()
    });
};

export { 
    createOrder, 
    getUserOrders, 
    getOrderById, 
    updateOrderStatus, 
    cancelOrder,
    completeOrder,
    getAllOrders,
    getOrdersByStatus,
    testOrders
};



