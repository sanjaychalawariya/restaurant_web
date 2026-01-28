import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';

// Remove the Stripe import for now - we'll handle payments differently
// import { loadStripe } from '@stripe/stripe-js';

// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PlaceOrder = () => {
  const { cartItems, food_list, token, user, clearCart } = useContext(StoreContext);
  const navigate = useNavigate();
  
  const [orderType, setOrderType] = useState('dine-in');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tableNo: '',
    customization: '',
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States' // Default value
    },
    contactInfo: {
      phone: user?.phone || '',
      email: user?.email || ''
    },
    paymentMethod: 'cash_on_delivery'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'tableNo') {
      const num = Number(value);
      if (num > 50) {
        setForm((prev) => ({ ...prev, tableNo: '50' }));
        return;
      }
      if (num < 1 && value !== '') return;
    }

    if (name.startsWith('deliveryAddress.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        deliveryAddress: { ...prev.deliveryAddress, [field]: value }
      }));
      return;
    }

    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, [field]: value }
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate order summary
  const orderItems = food_list.filter(item => cartItems[item._id] > 0)
    .map(item => ({
      foodId: item._id,
      name: item.name,
      price: item.price,
      quantity: cartItems[item._id],
      image: item.image
    }));

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = orderType === 'delivery' ? 5 : 0;
  const tax = subtotal * 0.1; // 10% tax
  const grandTotal = subtotal + deliveryFee + tax;

  const validateForm = () => {
    if (orderItems.length === 0) {
      alert('Your cart is empty');
      return false;
    }

    if (orderType === 'dine-in' && !form.tableNo) {
      alert('Please enter table number');
      return false;
    }

    if (orderType === 'delivery') {
      const { street, city, state, zipCode } = form.deliveryAddress;
      if (!street || !city || !state || !zipCode) {
        alert('Please complete delivery address');
        return false;
      }

      if (!form.contactInfo.phone) {
        alert('Phone number is required for delivery');
        return false;
      }

      // Basic phone validation
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(form.contactInfo.phone.replace(/[\s\-\(\)]/g, ''))) {
        alert('Please enter a valid phone number');
        return false;
      }

      // Basic email validation
      if (form.contactInfo.email && !form.contactInfo.email.includes('@')) {
        alert('Please enter a valid email address');
        return false;
      }
    }

    return true;
  };

  const handleOrderSubmission = async (orderData) => {
    try {
      const response = await fetch('http://localhost:4000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Clear cart only if user is logged in
        if (token) {
          clearCart();
        } else {
          // For guest users, clear local storage cart
          localStorage.removeItem('cartItems');
        }
        
        navigate('/order-confirmation', { 
          state: { 
            order: result.order,
            paymentMethod: form.paymentMethod
          }
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to place order');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const orderData = {
        items: orderItems,
        orderType,
        tableNo: form.tableNo,
        deliveryAddress: form.deliveryAddress,
        contactInfo: form.contactInfo,
        paymentMethod: form.paymentMethod,
        orderNotes: form.customization
      };

      if (form.paymentMethod === 'card') {
        // For card payments, we'll implement a simpler approach
        // You can integrate Stripe later when you set up the keys
        alert('Card payments are currently unavailable. Please choose Cash on Delivery.');
        setLoading(false);
        return;
      }

      await handleOrderSubmission(orderData);

    } catch (error) {
      console.error('Order error:', error);
      alert(`Order failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (orderItems.length === 0) {
    return (
      <div className="placeorder-empty">
        <h2>Your cart is empty</h2>
        <p>Add some delicious food to place an order!</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className='placeorder-container'>
      <h2>Place Your Order</h2>
      
      <div className='order-progress'>
        <div className='progress-step active'>1. Order Details</div>
        <div className='progress-step'>2. Payment</div>
        <div className='progress-step'>3. Confirmation</div>
      </div>

      <form className='placeorder-form' onSubmit={handleSubmit}>
        {/* Order Type Selection */}
        <div className='form-section'>
          <h3>Order Type</h3>
          <div className='order-type-selector'>
            <label className={orderType === 'dine-in' ? 'active' : ''}>
              <input
                type='radio'
                value='dine-in'
                checked={orderType === 'dine-in'}
                onChange={(e) => setOrderType(e.target.value)}
              />
              <span>🍽️ Dine-in</span>
            </label>
            <label className={orderType === 'delivery' ? 'active' : ''}>
              <input
                type='radio'
                value='delivery'
                checked={orderType === 'delivery'}
                onChange={(e) => setOrderType(e.target.value)}
              />
              <span>🚚 Delivery</span>
            </label>
          </div>
        </div>

        {/* Dine-in Fields */}
        {orderType === 'dine-in' && (
          <div className='form-section'>
            <h3>Table Information</h3>
            <label>
              Table Number *
              <input
                name='tableNo'
                type='number'
                min='1'
                max='50'
                value={form.tableNo}
                onChange={handleChange}
                required
                placeholder='Enter table number (1-50)'
              />
            </label>
          </div>
        )}

        {/* Delivery Fields */}
        {orderType === 'delivery' && (
          <>
            <div className='form-section'>
              <h3>Delivery Address</h3>
              <label>
                Street Address *
                <input
                  name='deliveryAddress.street'
                  type='text'
                  value={form.deliveryAddress.street}
                  onChange={handleChange}
                  required
                  placeholder='Enter street address'
                />
              </label>
              <div className='form-row'>
                <label>
                  City *
                  <input
                    name='deliveryAddress.city'
                    type='text'
                    value={form.deliveryAddress.city}
                    onChange={handleChange}
                    required
                    placeholder='City'
                  />
                </label>
                <label>
                  State *
                  <input
                    name='deliveryAddress.state'
                    type='text'
                    value={form.deliveryAddress.state}
                    onChange={handleChange}
                    required
                    placeholder='State'
                  />
                </label>
              </div>
              <div className='form-row'>
                <label>
                  ZIP Code *
                  <input
                    name='deliveryAddress.zipCode'
                    type='text'
                    value={form.deliveryAddress.zipCode}
                    onChange={handleChange}
                    required
                    placeholder='ZIP Code'
                  />
                </label>
                <label>
                  Country *
                  <input
                    name='deliveryAddress.country'
                    type='text'
                    value={form.deliveryAddress.country}
                    onChange={handleChange}
                    required
                    placeholder='Country'
                  />
                </label>
              </div>
            </div>

            <div className='form-section'>
              <h3>Contact Information</h3>
              <label>
                Phone Number *
                <input
                  name='contactInfo.phone'
                  type='tel'
                  value={form.contactInfo.phone}
                  onChange={handleChange}
                  required
                  placeholder='Enter phone number'
                />
              </label>
              <label>
                Email Address
                <input
                  name='contactInfo.email'
                  type='email'
                  value={form.contactInfo.email}
                  onChange={handleChange}
                  placeholder='Enter email address (optional)'
                />
              </label>
            </div>
          </>
        )}

        {/* Payment Method */}
        <div className='form-section'>
          <h3>Payment Method</h3>
          <div className='payment-methods'>
            <label className={form.paymentMethod === 'cash_on_delivery' ? 'active' : ''}>
              <input
                type='radio'
                name='paymentMethod'
                value='cash_on_delivery'
                checked={form.paymentMethod === 'cash_on_delivery'}
                onChange={handleChange}
              />
              <span>💵 Cash on Delivery</span>
            </label>
            <label className={form.paymentMethod === 'card' ? 'active' : ''}>
              <input
                type='radio'
                name='paymentMethod'
                value='card'
                checked={form.paymentMethod === 'card'}
                onChange={handleChange}
                disabled // Temporarily disabled
              />
              <span>💳 Credit/Debit Card (Coming Soon)</span>
            </label>
          </div>
        </div>

        {/* Special Instructions */}
        <div className='form-section'>
          <h3>Special Instructions</h3>
          <label>
            Customization (optional)
            <textarea
              name='customization'
              value={form.customization}
              onChange={handleChange}
              placeholder='Any special requests, dietary restrictions, or delivery instructions?'
              rows='3'
            />
          </label>
        </div>

        {/* Order Summary */}
        <div className='order-summary'>
          <h3>Order Summary</h3>
          <div className='order-items'>
            {orderItems.map((item) => (
              <div className='order-item' key={item.foodId}>
                <img src={`http://localhost:4000/images/${item.image}`} alt={item.name} 
                     onError={(e) => {
                       e.target.src = '/images/food-placeholder.jpg';
                     }} />
                <div className='item-details'>
                  <span className='item-name'>{item.name}</span>
                  <span className='item-quantity'>Qty: {item.quantity}</span>
                </div>
                <span className='item-price'>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className='order-totals'>
            <div className='total-row'>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className='total-row'>
              <span>Delivery Fee:</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className='total-row'>
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className='total-row grand-total'>
              <span>Total:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button 
          type='submit' 
          className='place-order-btn'
          disabled={loading}
        >
          {loading ? 'Placing Order...' : `Place Order - $${grandTotal.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};

export default PlaceOrder;