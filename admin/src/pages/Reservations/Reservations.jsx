import React, { useEffect, useState } from 'react'
import './Reservations.css'
import axios from 'axios'
import { toast } from 'react-toastify'

const Reservations = ({ url }) => {
    const [reservations, setReservations] = useState([]);

    const fetchReservations = async () => {
        try {
            const response = await axios.get(url + "/api/reservations/list");
            if (response.data.success) {
                setReservations(response.data.data);
            } else {
                toast.error("Error fetching reservations");
            }
        } catch (error) {
            toast.error("Error fetching reservations");
        }
    }

    const statusHandler = async (event, reservationId) => {
        try {
            const response = await axios.post(url + "/api/reservations/status", {
                id: reservationId,
                status: event.target.value
            });
            if (response.data.success) {
                await fetchReservations();
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    }

    useEffect(() => {
        fetchReservations();
    }, []);

    return (
        <div className='reservation-list add flex-col'>
            <h3>Table Reservations</h3>
            <div className="list-table">
                <div className="list-table-format title">
                    <b>Name</b>
                    <b>Email / Phone</b>
                    <b>Date & Time</b>
                    <b>Guests</b>
                    <b>Status</b>
                </div>
                {reservations.map((item, index) => {
                    return (
                        <div key={index} className='list-table-format'>
                            <p>{item.name}</p>
                            <p>{item.email}<br/>{item.phone}</p>
                            <p>{item.date} at {item.time}</p>
                            <p>{item.guests}</p>
                            <select onChange={(event) => statusHandler(event, item._id)} value={item.status}>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Reservations
