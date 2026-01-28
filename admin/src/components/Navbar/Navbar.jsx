import React from 'react'
import './Navbar.css'
import {assets} from '../../assets/assets'
const Navbar = () => {
  return (
    <div className='navbar'>
      <div className='brand'>
        <img className='logo' src={assets.logo} alt="" />
        <h2>TechnoHub Admin</h2>
      </div>
      <div className='nav-actions'>
        <a className='nav-link' href='/orders'>Orders</a>
        <a className='nav-link' href='/list'>Menu</a>
        <a className='nav-link' href='/add'>Add Item</a>
        <img className='profile' src={assets.profile_image} alt="" />
      </div>
    </div>
  )
}

export default Navbar
