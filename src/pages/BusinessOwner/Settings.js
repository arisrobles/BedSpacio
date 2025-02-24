import React, { useState, useEffect } from 'react';
import '../../assets/styles/Settings.css';
import { FaEnvelope, FaUser, FaBuildingUser, FaPhone, FaCamera, FaTrash } from 'react-icons/fa6';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        emailPass: '',
        businessName: '',
        businessAddress: '',
        businessType: '',
        registrationNumber: '',
        profile_image: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [imageMessage, setImageMessage] = useState({ type: '', text: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const API_URL = window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://your-production-backend.com";

    useEffect(() => {
        const userData = localStorage.getItem('user_profile');
        if (userData) {
            const parsedData = JSON.parse(userData);
            setFormData({
                name: parsedData.name || '',
                phone: parsedData.phone || '',
                email: parsedData.email || '',
                emailPass: '',
                businessName: parsedData.business_name || '',
                businessAddress: parsedData.business_address || '',
                businessType: parsedData.business_type || '',
                registrationNumber: parsedData.registration_number || '',
                profile_image: parsedData.profile_image || ''
            });

            if (parsedData.profile_image) {
                setProfileImageUrl(`${API_URL}/${parsedData.profile_image}`);
            }
        }
    }, [API_URL]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const userData = JSON.parse(localStorage.getItem('user_profile'));
            const response = await fetch(`${API_URL}/rental/updateProfile/${userData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            localStorage.setItem('user_profile', JSON.stringify(data.user));
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleBusinessSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const userData = JSON.parse(localStorage.getItem('user_profile'));
            const response = await fetch(`${API_URL}/rental/updateBusinessInfo/${userData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    business_name: formData.businessName,
                    business_address: formData.businessAddress,
                    business_type: formData.businessType,
                    registration_number: formData.registrationNumber
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update business information');
            }

            localStorage.setItem('user_profile', JSON.stringify(data.user));
            setMessage({ type: 'success', text: 'Business information updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const userData = JSON.parse(localStorage.getItem('user_profile'));
            const response = await fetch(`${API_URL}/rental/updateEmailCredentials/${userData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    email_pass: formData.emailPass
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update email settings');
            }

            localStorage.setItem('user_profile', JSON.stringify(data.user));
            setMessage({ type: 'success', text: 'Email settings updated successfully!' });
            setFormData(prev => ({ ...prev, emailPass: '' }));
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setImageMessage({ type: '', text: '' });

        try {
            const userData = JSON.parse(localStorage.getItem('user_profile'));
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await fetch(`${API_URL}/rental/updateProfileImage/${userData.id}`, {
                method: 'PUT',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload profile image');
            }

            localStorage.setItem('user_profile', JSON.stringify(data.user));
            setProfileImageUrl(`${API_URL}/${data.user.profile_image}`);
            setImageMessage({ type: 'success', text: 'Profile image updated successfully!' });
        } catch (error) {
            setImageMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProfileImage = () => {
        setShowDeleteModal(true);
    };

    const confirmDeleteImage = async () => {
        setShowDeleteModal(false);
        setLoading(true);
        setImageMessage({ type: '', text: '' });

        try {
            const userData = JSON.parse(localStorage.getItem('user_profile'));
            const response = await fetch(`${API_URL}/rental/deleteProfileImage/${userData.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete profile image');
            }

            localStorage.setItem('user_profile', JSON.stringify(data.user));
            setProfileImageUrl('');
            setProfileImagePreview(null);
            setImageMessage({ type: 'success', text: 'Profile image deleted successfully!' });
        } catch (error) {
            setImageMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const DeleteConfirmationModal = ({ onConfirm, onCancel }) => (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">Delete Profile Image</h3>
                </div>
                <div className="modal-body">
                    Are you sure you want to delete your profile image? This action cannot be undone.
                </div>
                <div className="modal-footer">
                    <button className="modal-button cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="modal-button delete" onClick={onConfirm}>
                        Delete Image
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="settings-container">
            <h1>Settings</h1>
            
            <div className="settings-tabs">
                <button 
                    className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <FaUser /> Profile Settings
                </button>
                <button 
                    className={`tab-button ${activeTab === 'business' ? 'active' : ''}`}
                    onClick={() => setActiveTab('business')}
                >
                    <FaBuildingUser /> Business Information
                </button>
                <button 
                    className={`tab-button ${activeTab === 'email' ? 'active' : ''}`}
                    onClick={() => setActiveTab('email')}
                >
                    <FaEnvelope /> Email Configuration
                </button>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="settings-content">
                {activeTab === 'profile' && (
                    <div className="settings-section">
                        <h2>Profile Settings</h2>
                        <div className="profile-image-container">
                            <div className="profile-image">
                                {(profileImagePreview || profileImageUrl) ? (
                                    <>
                                        <img 
                                            src={profileImagePreview || profileImageUrl} 
                                            alt="Profile"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                setProfileImageUrl('');
                                            }}
                                            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div className="profile-image-controls">
                                            <label className="image-upload-label" htmlFor="profileImage">
                                                <FaCamera />
                                                <input
                                                    type="file"
                                                    id="profileImage"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    style={{ display: 'none' }}
                                                    disabled={loading}
                                                />
                                            </label>
                                            <button 
                                                className="image-delete-button"
                                                onClick={handleDeleteProfileImage}
                                                disabled={loading}
                                                type="button"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="default-profile-icon">
                                            <FaUser />
                                        </div>
                                        <div className="profile-image-controls">
                                            <label className="image-upload-label" htmlFor="profileImage">
                                                <FaCamera />
                                                <span className="upload-text">Upload Photo</span>
                                                <input
                                                    type="file"
                                                    id="profileImage"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    style={{ display: 'none' }}
                                                    disabled={loading}
                                                />
                                            </label>
                                        </div>
                                    </>
                                )}
                            </div>
                            {loading && <div className="upload-loading">Processing...</div>}
                            {imageMessage.text && (
                                <div className={`image-message ${imageMessage.type}`}>
                                    {imageMessage.text}
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleProfileSubmit} className="settings-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    placeholder="Enter your phone number"
                                    required
                                />
                            </div>
                            <button type="submit" className="save-button" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'business' && (
                    <div className="settings-section">
                        <h2>Business Information</h2>
                        <form onSubmit={handleBusinessSubmit} className="settings-form">
                            <div className="form-group">
                                <label>Business Name</label>
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                    placeholder="Enter your business name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Business Type</label>
                                <input
                                    type="text"
                                    value={formData.businessType}
                                    onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                                    placeholder="Enter your business type"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Registration Number</label>
                                <input
                                    type="text"
                                    value={formData.registrationNumber}
                                    onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                                    placeholder="Enter your registration number"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Business Address</label>
                                <textarea
                                    value={formData.businessAddress}
                                    onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
                                    placeholder="Enter your business address"
                                    rows="3"
                                    required
                                />
                            </div>
                            <button type="submit" className="save-button" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Business Info'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'email' && (
                    <div className="settings-section">
                        <h2>Email Configuration</h2>
                        <p className="settings-description">
                            Configure your email credentials to enable automated booking confirmation notifications.
                            For enhanced security, please ensure you're using an application-specific password for your email service.
                        </p>

                        <form onSubmit={handleEmailSubmit} className="settings-form">
                            <div className="form-group">
                                <label>Business Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="Enter your business email address"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Application-Specific Password</label>
                                <input
                                    type="password"
                                    value={formData.emailPass}
                                    onChange={(e) => setFormData({...formData, emailPass: e.target.value})}
                                    placeholder="Enter your application-specific password"
                                    required
                                />
                            </div>

                            <small className="input-helper">
                                For security purposes, please use an application-specific password rather than your primary account password.
                            </small>

                            <button 
                                type="submit" 
                                className="save-button" 
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Update Configuration'}
                            </button>
                        </form>

                        <div className="settings-help">
                            <h3>Application-Specific Password Setup Guide</h3>
                            <p className="help-description">
                                Follow these steps to generate a secure application-specific password for your email service:
                            </p>
                            <ol>
                                <li>Access your Google Account Security settings</li>
                                <li>Verify that 2-Step Verification is activated for your account</li>
                                <li>Navigate to Security → App passwords</li>
                                <li>Select 'Other (Custom name)' from the application dropdown</li>
                                <li>Enter 'BedSpacio Booking System' as the application name</li>
                                <li>Generate and securely copy the provided password</li>
                                <li>Paste the generated password into the configuration form above</li>
                            </ol>
                            <div className="security-notice">
                                <strong>Security Notice:</strong> Your application-specific password is securely stored and used solely for sending booking confirmations through your email service.
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showDeleteModal && (
                <DeleteConfirmationModal
                    onConfirm={confirmDeleteImage}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </div>
    );
};

export default Settings; 