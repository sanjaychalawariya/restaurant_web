import React from 'react'
import Navbar from './components/navbar/Navbar'
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
// import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Footer from './components/Footer/Footer';
// In your App.js or routing file
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import MyOrders from './pages/MyOrders/MyOrders';
import Profile from './pages/Profile/Profile';

// Add these routes

function App() {
  return (
    <>
  
      <div className='app'>
        <Navbar />
      

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        {/* <Route path="/order" element={<PlaceOrder />} /> */}
        <Route path="/order" element={<PlaceOrder />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/profile" element={<Profile />} />
        </Routes>
        
      </div>
      <Footer />
    </>
    
  )
}

export default App
