import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/Auth.css';
import registerIllustration from '../../assets/images/login.jpg'; // You might want to use a different illustration
import facebookIcon from '../../assets/images/icons/fb.png';
import googleIcon from '../../assets/images/icons/google.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://your-production-backend.com";

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
      setError('Sign-up failed, please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/rental/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="illustration">
          <img src={registerIllustration} alt="House rental illustration" />
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h1>Create an Account</h1>
          <p className="subtitle">Join BedSpacio today</p>

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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="sign-in-btn">
              Create Account
            </button>
          </form>

          <div className="social-login">
            <p>Sign Up with</p>
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
            Already have an account? <a href="/login">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
