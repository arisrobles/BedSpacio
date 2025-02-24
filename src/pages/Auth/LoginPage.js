import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/Auth.css';
import loginIllustration from '../../assets/images/login.jpg';
import facebookIcon from '../../assets/images/icons/fb.png';
import googleIcon from '../../assets/images/icons/google.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000" // Development API
      : "https://your-production-backend.com"; // Production API

  useEffect(() => {
    // Load Google Sign-In SDK
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: '875280380466-buokmdgppe12ri5cnojedvgdp9b05hj2.apps.googleusercontent.com',
          callback: handleGoogleSignIn,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { 
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: 40,
            height: 40,
          }
        );
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/rental/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token & user details in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_profile', JSON.stringify(data.user));

      // Redirect to dashboard
      navigate('/admin/overview');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async (response) => {
    try {
      const res = await fetch(`${API_URL}/rental/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Google sign-in failed');
      }

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_profile', JSON.stringify(data.user));

      navigate('/');
    } catch (err) {
      setError('Sign-in failed, please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="illustration">
          <img src={loginIllustration} alt="House rental illustration" />
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h1>Welcome to BedSpacio</h1>
          <p className="subtitle">Sign in to your account</p>

          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <a href="/forgot-password" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="sign-in-btn">
              Sign In
            </button>
          </form>

          <div className="social-login">
            <p>Sign In with</p>
            <div className="social-buttons">
              <button className="social-btn facebook">
                <img src={facebookIcon} alt="Facebook" className="social-icon" />
              </button>
              <button className="social-btn google">
                <div id="google-signin-btn"></div>
                <img src={googleIcon} alt="Google" className="social-icon" style={{ position: 'absolute', pointerEvents: 'none' }} />
              </button>
            </div>
          </div>

          <p className="signup-prompt">
            Don't have an account? <a href="/register">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
