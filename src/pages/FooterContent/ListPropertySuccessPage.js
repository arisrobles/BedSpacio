import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../../assets/styles/ListPropertySuccessPage.css';

const ListPropertySuccessPage = () => {
  const { state } = useLocation();
  const { propertyId, propertyType, address } = state || {};

  return (
    <div className="list-property-success-page">
      <div className="success-container">
        <div className="success-content">
          <div className="success-icon">✓</div>
          <h1>Property Submitted Successfully!</h1>
          <div className="property-details">
            <p><strong>Property Type:</strong> {propertyType}</p>
            <p><strong>Location:</strong> {address}</p>
            <p><strong>Reference ID:</strong> {propertyId}</p>
          </div>
          <p className="success-message">
            Thank you for submitting your property listing. Your submission is currently under review.
          </p>
          <p className="review-info">
            Our team will carefully review your listing details and documentation. 
            We will contact you within 2-3 business days regarding the status of your listing.
            Please check your email for confirmation details.
          </p>
          <div className="action-buttons">
            <Link to="/" className="button secondary">Return to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListPropertySuccessPage; 