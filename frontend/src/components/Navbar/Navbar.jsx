import React, { useContext, useState, useEffect } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom';
import LoginSignUpPopup from '../LoginPopup/LoginSignUpPopup';
import { StoreContext } from '../../context/StoreContext';

const Navbar = () => {
    const [menu, setMenu] = useState("home");
    const [showLogin, setShowLogin] = useState(false);
    const { token, setToken, cartItems } = useContext(StoreContext);
    
    // Calculate total items in cart
    const getTotalCartItems = () => {
        if (!cartItems) return 0;
        return Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
    };

    const totalCartItems = getTotalCartItems();

    // Handle logout
    const handleLogout = () => {
        setToken("");
        localStorage.removeItem("token");
    };

    return (
        <div className='Navbar'>
            <Link to='/' style={{display:'flex', alignItems:'center', gap:8}}>
                <img src={assets.logo} alt='Taste' className='logo' />
                <span style={{fontWeight:700, fontSize:'1.2rem', color:'#333'}}>Taste</span>
            </Link>
            
            <ul className='navbar-menu'>
                <li>
                    <Link 
                        to='/' 
                        className={menu === "home" ? "active" : ""} 
                        onClick={() => setMenu("home")}
                    >
                        home
                    </Link>
                </li>
                <li>
                    <a 
                        href='/#explore-menu' 
                        className={menu === "menu" ? "active" : ""} 
                        onClick={() => setMenu("menu")}
                    >
                        menu
                    </a>
                </li>
                <li>
                    <Link 
                        to='/reserve' 
                        className={menu === "reserve" ? "active" : ""} 
                        onClick={() => setMenu("reserve")}
                    >
                        reserve table
                    </Link>
                </li>
                <li>
                    <a 
                        href='/#footer' 
                        className={menu === "contact us" ? "active" : ""} 
                        onClick={() => setMenu("contact us")}
                    >
                        contact us
                    </a>
                </li>
            </ul>
            
            <div className="navbar-right">
                <img src={assets.search_icon} alt='Search' />
                <div className="navbar-search-icon">
                    <Link to='/cart'>
                        <img src={assets.basket_icon} alt='Cart' />
                        {totalCartItems > 0 && <div className="dot">{totalCartItems}</div>}
                    </Link>
                </div>
                
                {!token ? (
                    <button onClick={() => setShowLogin(true)}>Login/Sign Up</button>
                ) : (
                    <div className='navbar-profile'>
                        <div className="dropdown">
                            <img src={assets.profile_icon} alt='Profile' className='profile-icon' />
                            <div className="dropdown-content">
                                <Link to="/profile">My Profile</Link>
                                <Link to="/orders">My Orders</Link>
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <LoginSignUpPopup isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </div>
    )
}

export default Navbar;