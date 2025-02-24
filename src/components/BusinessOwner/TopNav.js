import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaEnvelope, FaUser } from 'react-icons/fa';
import '../../assets/styles/TopNav.css';

const TopNav = () => {
  const location = useLocation();
  const [ownerName, setOwnerName] = useState('');

  useEffect(() => {
    const userProfile = localStorage.getItem('user_profile');
    if (userProfile) {
      const user = JSON.parse(userProfile);
      setOwnerName(user.name);
    }
  }, []);

  return (
    <div className="top-nav">
      <div className="nav-links">
        <Link 
          to="/admin/home" 
          className={location.pathname === '/admin/home' ? 'active' : ''}
        >
          <FaHome /> Home
        </Link>
        <Link 
          to="/admin/about" 
          className={location.pathname === '/admin/about' ? 'active' : ''}
        >
          <FaInfoCircle /> About
        </Link>
        <Link 
          to="/admin/contact" 
          className={location.pathname === '/admin/contact' ? 'active' : ''}
        >
          <FaEnvelope /> Contact
        </Link>
      </div>
      <div className="user-welcome">
        <FaUser />
        <span>Welcome, {ownerName || 'Admin'}</span>
      </div>
    </div>
  );
};

export default TopNav; 