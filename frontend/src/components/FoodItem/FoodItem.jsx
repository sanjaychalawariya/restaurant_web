import React, { useContext, useEffect, useRef, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

const FoodItem = ({ id, name, price, description, image }) => {
  const ref = useRef();
  const [isVisible, setIsVisible] = useState(false);
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
  const quantity = cartItems[id] || 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  // Fixed image URL construction
  const imageUrl = image ? `${url}/images/${image}` : assets.placeholder_image;

  return (
    <div className={`food-item ${isVisible ? 'visible' : ''}`} ref={ref}>
      <div className="food-item-img-container">
        <img className="food-item-image" src={imageUrl} alt={name} />
        {quantity > 0 && (
          <div className="food-item-quantity-badge">{quantity}</div>
        )}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt={`Rating for ${name}`} />
        </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-price">${price}</p>
        <div className="quantity-controls">
          <button 
            onClick={() => removeFromCart(id)} 
            disabled={quantity === 0} 
            className="qty-btn"
            aria-label={`Remove one ${name} from cart`}
          >
            -
          </button>
          <span className="quantity">{quantity}</span>
          <button 
            onClick={() => addToCart(id)} 
            className="qty-btn"
            aria-label={`Add one ${name} to cart`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;