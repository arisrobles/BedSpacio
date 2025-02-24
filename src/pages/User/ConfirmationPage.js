import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import '../../assets/styles/ConfirmationPage.css';

const ConfirmationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { room, branchName, duration, groupSize, totalPrice, renterName, renterEmail } = location.state || {};

    if (!room) {
        return <p>No inquiry details available.</p>;
    }

    return (
        <div className="confirmation-page-wrapper">
            <div className="confirmation-page-container">
                <FaCheckCircle className="confirmation-page-success-icon" />
                <h1>Thank You for Your Inquiry, {renterName}!</h1>
                <p>Your rental inquiry has been successfully submitted. Our team is reviewing your request and will contact you shortly to confirm availability and final details.</p>
                <p>If you have any inquiries or wish to modify your request, please do not hesitate to contact us.</p>

                <div className="confirmation-page-booking-details">
                    <h2>Inquiry Summary:</h2>
                    <ul>
                        <li><strong>Room:</strong> Room {room.room_number}</li>
                        <li><strong>Branch:</strong> {branchName}</li>
                        <li><strong>Duration of Stay:</strong> {duration} month(s)</li>
                        <li><strong>Group Size:</strong> {groupSize} guest(s)</li>
                        <li><strong>Total Price Estimate:</strong> ₱{totalPrice.toLocaleString()}</li>
                        <li><strong>Renter Name:</strong> {renterName}</li>
                        <li><strong>Renter Email:</strong> {renterEmail}</li>
                    </ul>
                </div>

                <div className="confirmation-page-action-buttons">
                    <button 
                        className="confirmation-page-action-button confirmation-page-secondary-button"
                        onClick={() => navigate('/')}
                    >
                        Return Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPage;
