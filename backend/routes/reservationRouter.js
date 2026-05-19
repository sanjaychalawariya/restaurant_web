import express from "express";
import { addReservation, listReservations, updateStatus } from "../controllers/reservationController.js";

const reservationRouter = express.Router();

reservationRouter.post("/add", addReservation);
reservationRouter.get("/list", listReservations);
reservationRouter.post("/status", updateStatus);

export default reservationRouter;
