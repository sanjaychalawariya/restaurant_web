import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './OrderConfirmation.css';
import { StoreContext } from '../../context/StoreContext';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order: initialOrder, isDemo } = location.state || {};
  const { token } = useContext(StoreContext);
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    if (!initialOrder?._id || isDemo) return;
    const id = initialOrder._id;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/orders/${id}`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        const data = await res.json();
        if (data.success && data.order) setOrder(data.order);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [initialOrder?._id, isDemo, token]);

  if (!order) {
    return (
      <div className="order-confirmation error">
        <h2>Order Not Found</h2>
        <p>We couldn't find your order details.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="order-confirmation">
      {isDemo && (
        <div className="demo-notice">
          <strong>Demo Mode:</strong> This is a demo order. Backend server is unavailable.
        </div>
      )}
      
      <div className="confirmation-header success">
        <div className="header-icon">✅</div>
        <h1>Order {isDemo ? 'Demo' : 'Confirmed'}!</h1>
        <p>Thank you for your order{isDemo ? ' demo' : ''}. {isDemo ? 'This is a demonstration.' : "We're preparing your food."}</p>
      </div>

      <div className="confirmation-details">
        <div className="detail-card">
          <h3>Order Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">Order ID:</span>
              <span className="value">#{order._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Order Type:</span>
              <span className="value capitalize">{order.orderType || 'dine-in'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Order Status:</span>
              <span className={`status-badge ${order.orderStatus}`}>
                {order.orderStatus}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Total Amount:</span>
              <span className="value">${order.finalAmount?.toFixed(2) || order.totalAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {order.tableNo && (
          <div className="detail-card">
            <h3>Table Information</h3>
            <div className="detail-item">
              <span className="label">Table Number:</span>
              <span className="value">Table {order.tableNo}</span>
            </div>
          </div>
        )}

        <div className="detail-card">
          <h3>Order Items</h3>
          <div className="order-items-list">
            {(order.items || []).map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">Quantity: {item.quantity}</span>
                </div>
                <div className="item-price">
                  ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="confirmation-actions">
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
        <button onClick={() => window.print()} className="btn-secondary">
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;