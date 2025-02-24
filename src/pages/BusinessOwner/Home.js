import React from 'react';
import { 
  FaBuilding, 
  FaUserTie, 
  FaCalendarCheck, 
  FaChartLine,
  FaFileContract,
  FaTools,
  FaUsersCog,
  FaFileAlt
} from 'react-icons/fa';
import TopNav from '../../components/BusinessOwner/TopNav';
import '../../assets/styles/AdminHome.css';

const Home = () => {
  return (
    <div className="admin-home">
      <TopNav />
      <header className="home-header">
        <h1>Business Management Dashboard</h1>
        <p>Access and manage your property portfolio</p>
      </header>

      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <div className="action-card">
            <div className="card-icon">
              <FaBuilding />
            </div>
            <h3>Property Management</h3>
            <p>Add or manage your property listings</p>
            <button className="action-btn">Manage Properties</button>
          </div>
          <div className="action-card">
            <div className="card-icon">
              <FaCalendarCheck />
            </div>
            <h3>Booking Overview</h3>
            <p>Review and process booking requests</p>
            <button className="action-btn">View Bookings</button>
          </div>
          <div className="action-card">
            <div className="card-icon">
              <FaUserTie />
            </div>
            <h3>Tenant Relations</h3>
            <p>Manage tenant information and leases</p>
            <button className="action-btn">Manage Tenants</button>
          </div>
          <div className="action-card">
            <div className="card-icon">
              <FaChartLine />
            </div>
            <h3>Business Analytics</h3>
            <p>View reports and financial metrics</p>
            <button className="action-btn">View Analytics</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 