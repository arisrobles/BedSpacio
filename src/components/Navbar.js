import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCog, FaSignOutAlt, FaCog, FaListAlt } from 'react-icons/fa'; // Importing React Icons
import '../assets/styles/Navbar.css';

// Optional utility to decode JWT and check expiration
const decodeJWT = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token's payload
    return payload.exp * 1000 > Date.now(); // Check if the token is expired
  } catch (error) {
    return false; // Invalid token
  }
};

const Navbar = ({ hasBackground = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to track menu open/close
  const [notification, setNotification] = useState(''); // State for notification message
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track if user is authenticated
  const [userProfile, setUserProfile] = useState(null); // State for user profile info
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Track dropdown menu visibility

  const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000" // Development API
    : "https://your-production-backend.com"; // Production API

  const mobileMenuRef = useRef(null); // Reference to the mobile menu

  // Check for authentication status on page load
  useEffect(() => {
    const token = localStorage.getItem('auth_token'); // Get token from localStorage
    if (token && decodeJWT(token)) {
      setIsAuthenticated(true); // User is authenticated if token exists and is valid
      const storedUserProfile = localStorage.getItem('user_profile');
      try {
        setUserProfile(storedUserProfile ? JSON.parse(storedUserProfile) : null);
      } catch (error) {
        console.error("Error parsing user profile JSON:", error);
        setUserProfile(null);
      }      
    } else {
      setIsAuthenticated(false); // User is not authenticated if the token is invalid or expired
    }
  }, []); // This will run once on component mount

  // Track scroll position
  useEffect(() => {
    if (!hasBackground) {
      const handleScroll = () => {
        if (window.scrollY > 0) {
          setIsScrolled(true); // Set navbar background color when scrolled
        } else {
          setIsScrolled(false); // Remove background color when at the top
        }
      };

      window.addEventListener('scroll', handleScroll);

      // Cleanup the event listener on component unmount
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setIsScrolled(true); // Always have the background color if hasBackground is true
    }
  }, [hasBackground]);

  // Toggle menu visibility on mobile
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close the menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false); // Close menu if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // Cleanup event listener
    };
  }, []);

  // Load Google Sign-In script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: '875280380466-buokmdgppe12ri5cnojedvgdp9b05hj2.apps.googleusercontent.com', // Replace with your actual client ID
          callback: handleGoogleSignIn,
        });

        // Only prompt if the user is not already signed in
        const token = localStorage.getItem('auth_token');
        if (!token) {
          window.google.accounts.id.prompt(); // Prompt the user if not authenticated
        }
      } else {
        console.error("Google SDK not loaded correctly.");
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleGoogleSignIn = (response) => {
    // Send the Google token to your backend
    fetch(`${API_URL}/rental/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: response.credential }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('User authenticated:', data);
        localStorage.setItem('auth_token', data.token); // Store token in localStorage
        setIsAuthenticated(true); // Set user as authenticated
        setUserProfile(data.user); // Store user profile data
        localStorage.setItem('user_profile', JSON.stringify(data.user)); // Store user profile in localStorage
        setNotification('Signed in successfully');
        setTimeout(() => setNotification(''), 3000);
      })
      .catch((err) => {
        console.error('Google sign-in error:', err);
        setNotification('Sign-in failed, please try again.');
        setTimeout(() => setNotification(''), 3000);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token'); // Remove token on logout
    localStorage.removeItem('user_profile'); // Remove user profile on logout
    setIsAuthenticated(false); // Set user as not authenticated
    setUserProfile(null); // Clear user profile state
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className={isScrolled ? 'scrolled' : ''}>
      <div className="logo">
        <Link to="/">BedSpacio</Link>
      </div>
      <div className="nav-links">
        {!isAuthenticated && (
          <>
            <Link to="/login">Sign In</Link>
          </>
        )}
        {isAuthenticated && (
          <div className="user-profile">
            <div
              className="profile-circle"
              onClick={toggleDropdown}
              style={{
                backgroundImage: `url(${userProfile?.picture})`,
                backgroundSize: 'cover',
              }}
            ></div>
            {isDropdownOpen && (
              <div className="dropdown-menu open">
                <button onClick={() => window.location.href = '/profile'}>
                  <FaUserCog /> Profile
                </button>
                <button onClick={() => window.location.href = '/settings'}>
                  <FaCog /> Settings
                </button>
                <button onClick={() => window.location.href = '/my-rentals'}>
                  <FaListAlt /> My Rentals
                </button>
                <button onClick={() => handleLogout()}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        )}
        <Link to="/rent-now" className="rent-now-btn">Rent Now</Link>
      </div>

      {/* Hamburger menu for mobile */}
      <div className="hamburger" onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      {/* Mobile menu (Drawer) */}
      <div ref={mobileMenuRef} className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
        {!isAuthenticated && (
          <>
            <Link to="/login" onClick={toggleMenu}>Sign In</Link>
          </>
        )}
        <Link to="/rent-now" className="rent-now-btn" onClick={toggleMenu}>Rent Now</Link>
        {isAuthenticated && (
          <div>
            <div
              className="profile-circle"
              onClick={toggleDropdown}
              style={{
                backgroundImage: `url(${userProfile?.picture})`,
                backgroundSize: 'cover',
              }}
            ></div>
            {/* Display the user's name next to the profile circle */}
            <span className="user-name">{userProfile?.name}</span>
            {isDropdownOpen && (
              <div className="dropdown-menu open">
                <button onClick={() => window.location.href = '/profile'}>
                  <FaUserCog /> Profile
                </button>
                <button onClick={() => window.location.href = '/settings'}>
                  <FaCog /> Settings
                </button>
                <button onClick={() => window.location.href = '/my-rentals'}>
                  <FaListAlt /> My Rentals
                </button>
                <button onClick={() => handleLogout()}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification Overlay */}
      {notification && (
        <div className="notification-overlay">
          <p>{notification}</p>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
