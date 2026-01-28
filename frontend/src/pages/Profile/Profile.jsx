import React, { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';

const Profile = () => {
  const { user, token } = useContext(StoreContext);

  if (!token) {
    return (
      <div className='container'>
        <h2>My Profile</h2>
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className='container'>
      <h2>My Profile</h2>
      <div className='profile-card'>
        <div><strong>Username:</strong> {user?.username || 'N/A'}</div>
        <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
      </div>
    </div>
  );
};

export default Profile;



