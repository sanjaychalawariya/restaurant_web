import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const MyOrders = () => {
  const { token, user } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!token) {
          setError('Please sign in to view your orders.');
          setLoading(false);
          return;
        }
        const res = await fetch('http://localhost:4000/api/orders/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to load orders');
        setOrders(data.orders || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) return <div className='container'><p>Loading your orders...</p></div>;
  if (error) return (
    <div className='container'>
      <p>{error}</p>
      <button className='btn-primary' onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );

  if (!orders.length) return (
    <div className='container'>
      <h2>My Orders</h2>
      <p>You have no orders yet.</p>
      <button className='btn-primary' onClick={() => navigate('/')}>Browse Menu</button>
    </div>
  );

  return (
    <div className='container'>
      <h2>My Orders</h2>
      <p style={{marginTop: 4, color: '#555'}}>Signed in as {user?.username || 'User'} ({user?.email || 'no email'})</p>
      <div className='orders-list'>
        {orders.map((o) => (
          <div key={o._id} className='order-card'>
            <div className='order-header'>
              <span>Order #{o._id.slice(-6)}</span>
              <span className={`status ${o.orderStatus}`}>{o.orderStatus}</span>
            </div>
            <div className='order-items'>
              {(o.items || []).map((it) => (
                <div key={it.foodId?._id || it.foodId} className='order-item'>
                  <span>{it.name}</span>
                  <span>x{it.quantity}</span>
                  <span>${Number(it.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className='order-footer'>
              <span>Total: ${Number(o.finalAmount || o.totalAmount).toFixed(2)}</span>
              <span>Placed: {new Date(o.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;


