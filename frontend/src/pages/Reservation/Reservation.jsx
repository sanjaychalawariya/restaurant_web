import React, { useState } from 'react'
import './Reservation.css'
import axios from 'axios'
import { toast } from 'react-toastify'

const Reservation = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        guests: 2
    })

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            // Need absolute URL for local testing or relative if proxy setup
            const url = "http://localhost:4000";
            const response = await axios.post(url + "/api/reservations/add", data);
            if (response.data.success) {
                toast.success(response.data.message);
                setData({
                    name: "",
                    email: "",
                    phone: "",
                    date: "",
                    time: "",
                    guests: 2
                });
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Error booking table");
        }
    }

    return (
        <div className='reservation-container fade-in-scale-up'>
            <div className="reservation-header">
                <h2>Reserve a Table</h2>
                <p>Experience fine dining at Lumière. Please fill out the form to secure your reservation.</p>
            </div>
            <form onSubmit={onSubmitHandler} className="reservation-form">
                <div className="multi-fields">
                    <input required name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Full Name' />
                    <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
                </div>
                <div className="multi-fields">
                    <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone Number' />
                    <input required name='guests' onChange={onChangeHandler} value={data.guests} type="number" min="1" max="20" placeholder='Number of Guests' />
                </div>
                <div className="multi-fields">
                    <input required name='date' onChange={onChangeHandler} value={data.date} type="date" />
                    <input required name='time' onChange={onChangeHandler} value={data.time} type="time" />
                </div>
                <button type='submit' className='btn-luxury reserve-btn'>Confirm Reservation</button>
            </form>
        </div>
    )
}

export default Reservation
