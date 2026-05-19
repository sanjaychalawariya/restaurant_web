import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    status: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now }
});

const ReservationModel = mongoose.models.reservation || mongoose.model("reservation", reservationSchema);
export default ReservationModel;
