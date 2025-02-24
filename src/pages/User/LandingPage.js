import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SearchBar from '../../components/Searchbar';
import Branches from '../../pages/User/BranchesPage';
import '../../assets/styles/LandingPage.css';

const LandingPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000" // Development API
    : "https://your-production-backend.com"; // Production API

  // Handle Google Sign-In
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
        // Store the auth token and user profile in localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_profile', JSON.stringify(data.user)); // Store user profile

        setIsAuthenticated(true); // User is now authenticated
        navigate('/'); // Redirect after successful login
      })
      .catch((err) => {
        console.error('Google sign-in error:', err);
        alert('Sign-in failed, please try again.');
      });
  };

  useEffect(() => {
    // Check if the user is authenticated by looking for the auth token in localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true); // User is authenticated
    } else {
      setIsAuthenticated(false); // User is not authenticated
    }

    // Dynamically load the Google Sign-In SDK
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

        // Render a customized Google Sign-In button
        if (!isAuthenticated) {
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-btn-btn-btn'),
            {
              type: 'standard', // Options: standard, icon
              theme: 'outline', // Options: outline, filled_blue, filled_black
              size: 'large',    // Options: small, medium, large
              width: '300',     // Customize the button width
              text: 'signin_with', // Options: signin_with, signup_with
              shape: 'pill',    // Options: rectangular, pill, circle
            }
          );
        }
      }
    };
    document.body.appendChild(script);
  }, [isAuthenticated]);  

  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Find Your Perfect Home</h1>
          <p>
            Explore a variety of apartments that suit your lifestyle. From cozy
            studios to spacious family homes, we've got you covered.
          </p>
          <SearchBar />

          {/* Google Sign-In Button */}
          {!isAuthenticated && (
            <div id="google-signin-btn-btn-btn" className="google-signin"></div>
          )}
        </div>
      </section>

      {/* Branches Section */}
      <section className="branches-section">
        <Branches />
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
