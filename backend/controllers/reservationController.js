import ReservationModel from "../models/reservationModel.js";

// Add a new reservation
const addReservation = async (req, res) => {
    try {
        const { name, email, phone, date, time, guests } = req.body;
        const reservation = new ReservationModel({
            name, email, phone, date, time, guests
        });
        await reservation.save();
        res.json({ success: true, message: "Table Reserved Successfully!" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error reserving table" });
    }
}

// List all reservations for admin
const listReservations = async (req, res) => {
    try {
        const reservations = await ReservationModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: reservations });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching reservations" });
    }
}

// Update reservation status
const updateStatus = async (req, res) => {
    try {
        await ReservationModel.findByIdAndUpdate(req.body.id, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating status" });
    }
}

export { addReservation, listReservations, updateStatus };
