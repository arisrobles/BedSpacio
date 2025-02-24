import React from 'react';
import { 
  FaBuilding, 
  FaUsersCog, 
  FaChartLine, 
  FaTools,
  FaShieldAlt,
  FaHandshake 
} from 'react-icons/fa';
import TopNav from '../../components/BusinessOwner/TopNav';
import '../../assets/styles/AdminAbout.css';

const About = () => {
  return (
    <div className="admin-about">
      <TopNav />
      <header className="about-header">
        <h1>About Our Platform</h1>
      </header>

      <section className="about-content">
        <div className="about-section mission">
          <div className="section-icon">
            <FaHandshake />
          </div>
          <h2>Our Mission</h2>
          <p>Empowering property owners with professional management tools while ensuring exceptional living experiences for tenants.</p>
        </div>

        <div className="about-section">
          <h2>Professional Services</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">
                <FaBuilding />
              </div>
              <h3>Property Management</h3>
              <p>Enterprise-grade tools for portfolio management</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <FaUsersCog />
              </div>
              <h3>Tenant Management</h3>
              <p>Streamlined tenant relationship systems</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <FaChartLine />
              </div>
              <h3>Financial Analytics</h3>
              <p>Comprehensive financial tracking and reporting</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <FaTools />
              </div>
              <h3>Maintenance Systems</h3>
              <p>Efficient maintenance request handling</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>
              <h3>Security Protocols</h3>
              <p>Advanced security measures for your data</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 