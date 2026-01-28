import React, { useContext, useState } from 'react';
import './LoginSignUpPopup.css';
import { StoreContext } from '../../context/StoreContext';
import axios from "axios";

const LoginSignUpPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { url, setToken } = useContext(StoreContext);

  const [isLogin, setIsLogin] = useState(true);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);


  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    username: '',
    email: '',
    password: ''
  });


  // useEffect(() => {
  //   setLoginData({ email: '', password: '' });
  //   setSignUpData({ username: '', email: '', password: '' });
  //   setError(null);
  // }, [isLogin]);

  const onLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const onSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({ ...prev, [name]: value }));
  };

    const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateUsername = (username) => {
    return username.length >= 3 && username.length <= 20;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!validateEmail(loginData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!validatePassword(loginData.password)) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${url}/api/user/login`, loginData);
      console.log('Login result:', response.data);
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        onClose(); // Close popup on successful login
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!validateUsername(signUpData.username)) {
      setError('Username must be between 3 and 20 characters');
      return;
    }
    
    if (!validateEmail(signUpData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!validatePassword(signUpData.password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${url}/api/user/register`, signUpData);
      console.log('Signup result:', response.data);
      if (response.data.success) {
        // Optional: auto-login after signup or show success message
        onClose(); // Close popup after successful signup for now
      } else {
        setError(response.data.message || 'Signup failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Signup error');
    } finally {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

const togglePasswordVisibility = () => {
  setShowPassword(!showPassword);
};

  return (
    <div className='popup-overlay' onClick={onClose}>
      <div className='popup-container' onClick={e => e.stopPropagation()}>
        <button className='close-btn' onClick={onClose}>&times;</button>
        <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>

        {error && <div className="error-message">{error}</div>}

        {isLogin ? (
          <form className='popup-form' onSubmit={handleLoginSubmit}>
            <label>
              Email
              <input
                name='email'
                type='email'
                required
                placeholder='Enter your email'
                value={loginData.email}
                onChange={onLoginChange}
              />
            </label>
<label>
  Password
  <div className="password-input-container">
    <input
      name='password'
      type={showPassword ? 'text' : 'password'}
      required
      placeholder='Enter your password'
      value={loginData.password}
      onChange={onLoginChange}
    />
    <button 
      type="button" 
      className="password-toggle"
      onClick={togglePasswordVisibility}
    >
      {showPassword ? '🙈' : '👁️'}
    </button>
  </div>
</label>
            <button type='submit' className='submit-btn' disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <p>
              Don't have an account?{' '}
              <button
                type='button'
                className='toggle-btn'
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
              >
                Sign Up
              </button>
            </p>
          </form>
        ) : (
          <form className='popup-form' onSubmit={handleSignUpSubmit}>
            <label>
              Username
              <input
                name='username'
                type='text'
                required
                placeholder='Enter your username'
                value={signUpData.username}
                onChange={onSignUpChange}
              />
            </label>
            <label>
              Email
              <input
                name='email'
                type='email'
                required
                placeholder='Enter your email'
                value={signUpData.email}
                onChange={onSignUpChange}
              />
            </label>
            <label>
              Password
              <input
                name='password'
                type='password'
                required
                placeholder='Create a password'
                value={signUpData.password}
                onChange={onSignUpChange}
              />
            </label>
            <button type='submit' className='submit-btn' disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
            <p>
              Already have an account?{' '}
              <button
                type='button'
                className='toggle-btn'
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
              >
                Log In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginSignUpPopup;
