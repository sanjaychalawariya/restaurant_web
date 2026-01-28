import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, food_list, removeFromCart, url } = useContext(StoreContext);
  const navigate = useNavigate();

  // Calculate grand total price of cart items
  const grandTotal = food_list.reduce((acc, item) => {
    const quantity = cartItems[item._id] || 0;
    return acc + quantity * item.price;
  }, 0);

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <hr />

        {/* List cart items with quantity > 0 */}
        {food_list.map((item) => {
          const quantity = cartItems[item._id] || 0;
          if (quantity > 0) {
            const total = (item.price * quantity).toFixed(2);
            const imageUrl = item.image ? `${url}/images/${item.image}` : '/placeholder-image.png';
            
            return (
              <div className="cart-items-item" key={item._id}>
                <img src={imageUrl} alt={item.name}/>
                <p>{item.name}</p>
                <p>${item.price.toFixed(2)}</p>
                <p>{quantity}</p>
                <p>${total}</p>
                <p>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove
                  </button>
                </p>
              </div>
            );
          }
          return null;
        })}

        {/* Show message when cart is empty */}
        {grandTotal === 0 && (
          <div className="cart-empty">
            <p>Your cart is empty</p>
            <button onClick={() => navigate('/')} className="continue-shopping-btn">
              Continue Shopping
            </button>
          </div>
        )}

        {/* Grand total display (only show when there are items) */}
        {grandTotal > 0 && (
          <div className="cart-grand-total">
            <h3>Grand Total: ${grandTotal.toFixed(2)}</h3>
            <button onClick={() => navigate('/order')} className="checkout-btn">
              Proceed to Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;