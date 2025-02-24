import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../../assets/styles/AdminDashboard.css';
import logo from '../../assets/images/hero-cover.jpg';
import { FaUser } from 'react-icons/fa';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [businessName, setBusinessName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Add ref for the profile modal
    const profileModalRef = React.useRef(null);

    const API_URL = window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://your-production-backend.com";

    useEffect(() => {
        // Retrieve user data from localStorage
        const userData = localStorage.getItem('user_profile');
        if (userData) {
            const parsedData = JSON.parse(userData);
            setBusinessName(parsedData.business_name || 'Your Business');
            setOwnerName(parsedData.name || 'Admin');
            setProfileImage(parsedData.profile_image ? `${API_URL}/${parsedData.profile_image}` : '');
        }
    }, [API_URL]);

    // Handle clicks outside the profile modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileModalRef.current && !profileModalRef.current.contains(event.target)) {
                setShowProfileModal(false);
            }
        };

        if (showProfileModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileModal]);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_profile');
        navigate('/login');
    };

    const handleLogoutClick = () => {
        setShowProfileModal(false);
        setShowLogoutConfirm(true);
    };

    // Handle menu item clicks
    const handleMenuItemClick = (action) => {
        setShowProfileModal(false);  // Close the menu first
        
        switch(action) {
            case 'profile':
                navigate('/admin/profile');
                break;
            case 'settings':
                navigate('/admin/settings');
                break;
            case 'logout':
                setShowLogoutConfirm(true);
                break;
            default:
                break;
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="logo">
                    <img src={logo} alt="Home Rental Logo" />
                </div>
                <div className="business-name">
                    <h3>{businessName}</h3>
                </div>
                <nav>
                    <ul>
                        <li>
                            <Link 
                                to="/admin/overview" 
                                className={`menu-item ${location.pathname === '/admin/overview' ? 'active' : ''}`}
                            >
                                <i className="icon fas fa-chart-line"></i> Overview
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/admin/properties" 
                                className={`menu-item ${location.pathname === '/admin/properties' ? 'active' : ''}`}
                            >
                                <i className="icon fas fa-building"></i> Properties
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/admin/bookings" 
                                className={`menu-item ${location.pathname === '/admin/bookings' ? 'active' : ''}`}
                            >
                                <i className="icon fas fa-calendar-check"></i> Bookings
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/admin/rooms" 
                                className={`menu-item ${location.pathname === '/admin/rooms' ? 'active' : ''}`}
                            >
                                <i className="icon fas fa-door-open"></i> Rooms
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/admin/tenants" 
                                className={`menu-item ${location.pathname === '/admin/tenants' ? 'active' : ''}`}
                            >
                                <i className="icon fas fa-users"></i> Tenants
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/admin/reports" 
                                className={`menu-item ${location.pathname === '/admin/reports' ? 'active' : ''}`}
                            >
                                <i className="icon fas fa-chart-bar"></i> Reports
                            </Link>
                        </li>
                    </ul>
                </nav>
                
                <div className="sidebar-footer">
                    <div className="user-info" onClick={() => setShowProfileModal(true)}>
                        <div className="user-avatar">
                            {profileImage ? (
                                <img 
                                    src={profileImage}
                                    alt={ownerName}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<i class="fas fa-user"></i>';
                                    }}
                                />
                            ) : (
                                <FaUser />
                            )}
                        </div>
                        <div className="user-details">
                            <p className="user-role">{ownerName}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="modal profile-modal">
                    <div className="profile-modal-content" ref={profileModalRef}>
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {profileImage ? (
                                    <img src={profileImage} alt={ownerName} />
                                ) : (
                                    <FaUser />
                                )}
                            </div>
                            <div className="profile-info">
                                <h3>{ownerName}</h3>
                                <p>{businessName}</p>
                            </div>
                        </div>
                        <ul className="profile-menu">
                            <li onClick={() => handleMenuItemClick('profile')}>
                                <i className="fas fa-user"></i>
                                My Profile
                            </li>
                            <li onClick={() => handleMenuItemClick('settings')}>
                                <i className="fas fa-cog"></i>
                                Settings
                            </li>
                            <li onClick={() => handleMenuItemClick('logout')} className="logout-option">
                                <i className="fas fa-sign-out-alt"></i>
                                Logout
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="modal logout-confirm-modal">
                    <div className="logout-confirm-content">
                        <h3>Confirm Logout</h3>
                        <p>Are you sure you want to logout?</p>
                        <div className="logout-confirm-buttons">
                            <button 
                                className="cancel-btn"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="confirm-btn"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminDashboard;
