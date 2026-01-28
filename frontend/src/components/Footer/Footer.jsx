import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">

            <img src={assets.logo} alt=''
            style={{ cursor: 'pointer' }} 
  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            <p>© 2024 All rights reserved.
Crafted with love and fresh ingredients.</p>
            <img src={assets.facebook_icon} alt=''/>
            <img src={assets.twitter_icon} alt=''/>
            <img src={assets.linkedin_icon} alt=''/>
        </div>
        <div className="footer-content-center">
            <h2>COMPANY</h2>
            <ul>
                <li>Home</li>
                <li>About us</li>
                <li>Delivery</li>
                <li>Privacy policy</li>

            </ul>
        </div>
        <div className="footer-content-right">
            <h2>GET IN TOUCH</h2>
            <ul>
  <li><a href="tel:+919214888885">+91-9214888885</a></li>
  <li><a href="mailto:jaychalawariya@gmail.com">jaychalawariya@gmail.com</a></li>
</ul>
        </div>
      </div>
      <p className='footer-copyright'>© 2024 All rights reserved.</p>
    </div>
  )
}

export default Footer
