import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import TopNav from '../../components/BusinessOwner/TopNav';
import '../../assets/styles/AdminOverview.css';

const AdminOverview = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const checkTokenExpiration = () => {
            const token = localStorage.getItem('auth_token');
            const userProfile = localStorage.getItem('user_profile');

            if (!token) {
                console.warn('⚠️ No authentication token found. Redirecting to login...');
                handleSessionExpired();
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000; // Convert milliseconds to seconds

                if (decodedToken.exp < currentTime) {
                    console.warn('🔴 Token expired. Clearing data and redirecting to login...');
                    handleSessionExpired();
                    return;
                }

                console.log('✅ Token is valid.');
                if (userProfile) {
                    const user = JSON.parse(userProfile);
                }
            } catch (error) {
                console.error('⚠️ Invalid token:', error);
                handleSessionExpired();
            }
        };

        // Run token check when component mounts
        checkTokenExpiration();

        // Set an interval to check token expiration every second
        const interval = setInterval(checkTokenExpiration, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    const handleSessionExpired = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_profile');
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        navigate('/login');
    };

    return (
        <main className="content">
            <header className="content-header">
                <TopNav />
            </header>

            <div className="stats-section">
                <div className="stat-card-container">
                    <div className="stat-card blue">
                        <div className="icon">🏠</div>
                        <h3>4 Properties</h3>
                    </div>
                    <Link to="#">View Details &rarr;</Link>
                </div>
                <div className="stat-card-container">
                    <div className="stat-card green">
                        <div className="icon">👨‍👩‍👧‍👦</div>
                        <h3>4 Tenants</h3>
                    </div>
                    <Link to="#">View Details &rarr;</Link>
                </div>
                <div className="stat-card-container">
                    <div className="stat-card yellow">
                        <div className="icon">💳</div>
                        <h3>129 Bookings</h3>
                    </div>
                    <Link to="#">View Details &rarr;</Link>
                </div>
                <div className="stat-card-container">
                    <div className="stat-card teal">
                        <div className="icon">🏚️</div>
                        <h3>7 Vacant Houses</h3>
                    </div>
                    <Link to="#">View Details &rarr;</Link>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay-expire">
                    <div className="modal-content-expire">
                        <h2>Session Expired</h2>
                        <p>Your session has expired. Please log in again.</p>
                        <button onClick={handleModalClose}>OK</button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default AdminOverview;
