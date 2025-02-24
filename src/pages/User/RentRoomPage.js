import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../assets/styles/RentRoomPage.css';

const RentRoomPage = () => {
    const { state } = useLocation();
    const room = state?.room;
    const branchName = state?.branchName;
    const branchId = state?.branchId;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        duration: 1,
        groupSize: 1,
        isAlone: true,
        gender: '',
        message: '',
        error: ''
    });

    const navigate = useNavigate();

    const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000" // Development API
      : "https://your-production-backend.com"; // Production API

    useEffect(() => {
        // Check if user profile exists in localStorage
        const storedUserProfile = JSON.parse(localStorage.getItem('user_profile')); // Retrieve user profile from localStorage
    
        if (storedUserProfile) {
            console.log('User profile retrieved from local storage:', storedUserProfile); // Log the user profile
            setFormData((prevData) => ({
                ...prevData,
                name: storedUserProfile.name || '',
                email: storedUserProfile.email || ''
            }));
        } else {
            console.log('No user profile found in local storage.');
        }
    }, []);    

    if (!room) {
        return <p>We are sorry, but the room details could not be retrieved at the moment. Please go back and try again later.</p>;
    }

    const slotsLeft = room.max_occupancy - (room.total_renters || 0);
    const status = slotsLeft <= 0 ? 'Occupied' : `Slots Available: ${slotsLeft}`;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (status === 'Occupied') {
            setFormData((prevData) => ({
                ...prevData,
                error: 'This room is occupied. Please choose another room.'
            }));
            return;
        }
    
        if (!formData.isAlone && formData.groupSize > slotsLeft) {
            setFormData((prevData) => ({
                ...prevData,
                error: `The number of renters exceeds the available slots. Only ${slotsLeft} slots are available.`
            }));
            return;
        }
    
        try {
            const response = await fetch(`${API_URL}/rental/saveRenter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    contact: formData.contact,
                    duration: formData.duration,
                    room_id: room.id,
                    branch_id: branchId,
                    branch_name: branchName,
                    room_number: room.room_number,
                    is_alone: formData.isAlone,
                    group_size: formData.isAlone ? 1 : formData.groupSize,
                    gender: formData.gender,
                    owner_id: room.owner_id
                }),
            });
        
            const data = await response.json();
        
            if (response.ok) {
                setFormData({
                    ...formData,
                    message: data.message,
                    name: '',
                    email: '',
                    contact: '',
                    duration: 1,
                    isAlone: true,
                    groupSize: 1,
                    error: ''
                });
        
                navigate('/confirmation', {
                    state: {
                        room: room,
                        branchName: branchName,
                        duration: formData.duration,
                        groupSize: formData.isAlone ? 1 : formData.groupSize,
                        totalPrice: room.price_per_night * formData.duration * (formData.isAlone ? 1 : formData.groupSize),
                        renterName: formData.name,
                        renterEmail: formData.email,
                        roomId: room.id
                    }
                });
            } else {
                // Ensure 'error' is a string, not an object
                setFormData((prevData) => ({
                    ...prevData,
                    error: typeof data.error === 'string' ? data.error : 'An unexpected error occurred.'
                }));
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setFormData((prevData) => ({
                ...prevData,
                error: 'Server error, please try again later.'
            }));
        }        
    };    

    return (
        <div className="rent-room-page">
            <Navbar hasBackground={true} />
            <div className="rent-room-container">
                <div className="intro-section">
                    <h1>Learn more about this Room</h1>
                    <p>We’re thrilled to have you here! Explore the room details below and get ready to make this space your new home. Let’s start your rental journey today!</p>
                </div>
                <div className="rent-room-row">
                    <div className="room-image-container">
                        <img
                            src={room.image ? require(`../../assets/images/rooms/${room.image}`) : require('../../assets/images/rooms/default-room.jpg')}
                            alt={`Room ${room.room_number}`}
                            className="room-image"
                        />
                    </div>
                    <div className="room-details-container">
                        <h1>{branchName || `Branch #${branchId}`}</h1>
                        <h2>Room {room.room_number}</h2>
                        <p><strong>Description:</strong> {room.description || 'No description available for this room.'}</p>
                        <p><strong>Price Per Month:</strong> ₱{room.price_per_night.toLocaleString()}</p>
                        <p><strong>Maximum Occupancy:</strong> {room.max_occupancy} guests</p>
                        <p><strong>Status:</strong> {status}</p>
                        <p><strong>Owner Id:</strong> {room.owner_id}</p>
                        <p>For additional information or to proceed with the rental, please complete the form below.</p>
                    </div>
                </div>
    
                <div className="form-container">
                    {formData.message && (
                        <p className="success-message">
                            <i className="fas fa-check-circle" style={{ color: 'green', marginRight: '10px' }}></i>
                            {formData.message}
                        </p>
                    )}
                    {formData.error && (
                        <p className="error-message">
                            <i className="fas fa-exclamation-circle" style={{ color: 'red', marginRight: '10px' }}></i>
                            {formData.error}
                        </p>
                    )}
    
                    <form onSubmit={handleSubmit}>
                        <label>
                            Full Name:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label>
                            Gender:
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </label>
                        <label>
                            Email Address:
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label>
                            Contact Number:
                            <input
                                type="text"
                                name="contact"
                                value={formData.contact}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label>
                            Duration of Stay (Months):
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                min="1"
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label className='checkbox-label'>
                            Do you rent alone?
                            <input
                                type="checkbox"
                                name="isAlone"
                                checked={formData.isAlone}
                                onChange={handleInputChange}
                            />
                        </label>
    
                        {!formData.isAlone && (
                            <label>
                               Pls specify the number of renters:
                                <input
                                    type="number"
                                    name="groupSize"
                                    value={formData.groupSize}
                                    min="1"
                                    max={room.max_occupancy}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>
                        )}
    
                        <button type="submit">Confirm Rental</button>
                    </form>
    
                    <p>If you need further assistance or have any inquiries, please do not hesitate to contact us.</p>
                </div>
            </div>
            <Footer />
        </div>
    );    
};

export default RentRoomPage;
