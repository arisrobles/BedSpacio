import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Footer.css'; // Ensure this path matches your project structure

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Find Your Home</h4>
          <ul>
            <li>Search Rentals</li>
            <li>Featured Properties</li>
            <li>Student Housing</li>
            <li>Short-term Rentals</li>
            <li>New Listings</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Renter Resources</h4>
          <ul>
            <li>Rental Application Guide</li>
            <li>Tenant Insurance</li>
            <li>Moving Tips</li>
            <li>Rental Calculator</li>
            <li>Area Guides</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Property Owners</h4>
          <ul>
            <li><Link to="/list-property">List Your Property</Link></li>
            <li>Landlord Dashboard</li>
            <li>Screening Services</li>
            <li>Property Management</li>
            <li>Owner Resources</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Help & Support</h4>
          <ul>
            <li>24/7 Support</li>
            <li>Rental Guides</li>
            <li>Safety Guidelines</li>
            <li>Report an Issue</li>
            <li>Contact Us</li>
          </ul>
          <button className="contact-support">Get Support</button>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="languages">
          <span>English</span>
          <span>Español</span>
          <span>Français</span>
          <span>中文</span>
        </div>
        <div className="footer-info">
          <p>&copy; 2025 BedSpacio | All Rights Reserved</p>
          <div className="legal-links">
            <a href="#">Terms & Conditions</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Fair Housing</a>
          </div>
        </div>
        <div className="social-icons">
          <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
          <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
          <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
          <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
