import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false // Allow guest orders
    },
    items: [{
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'food',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        image: {
            type: String,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: true
    },
    orderType: {
        type: String,
        enum: ['dine-in', 'delivery'],
        default: 'dine-in'
    },
    tableNo: {
        type: String,
        required: function() { return this.orderType === 'dine-in'; }
    },
    deliveryAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String, default: 'United States' }
    },
    contactInfo: {
        phone: { type: String },
        email: { type: String }
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'],
        default: 'cash_on_delivery'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    orderNotes: {
        type: String,
        maxlength: 500
    },
    paymentIntentId: {
        type: String
    },
    stripeSessionId: {
        type: String
    }
}, { 
    timestamps: true 
});

// Indexes for better performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Instance method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
    const nonCancellableStatuses = ['out_for_delivery', 'delivered', 'cancelled'];
    return !nonCancellableStatuses.includes(this.orderStatus);
};

// Instance method to check if order can be completed (delivered)
orderSchema.methods.canBeCompleted = function() {
    const nonCompletableStatuses = ['cancelled', 'delivered'];
    return !nonCompletableStatuses.includes(this.orderStatus);
};

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;




