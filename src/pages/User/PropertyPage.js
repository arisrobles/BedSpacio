import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Facilitates access to branch ID from the URL
import Navbar from '../../components/Navbar'; // Navigation bar component
import Footer from '../../components/Footer'; // Footer component
import RatingsAndReviews from '../../pages/User/RatingsAndReviewsPage';
import '../../assets/styles/PropertyPage.css';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook

const PropertyPage = () => {
  const { id } = useParams(); // Retrieves the branch ID from the URL
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigate

  const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000" // Development API
    : "https://your-production-backend.com"; // Production API

  const getImagePath = (imageName) => {
    try {
      return require(`../../assets/images/branches/${imageName}`);
    } catch (error) {
      console.error(`Image not found: ${imageName}`);
      return null;
    }
  };

  const generateMapIframeSrc = (mapLink, address) => {
    if (mapLink) {
      return mapLink; // Custom map link if provided
    }
    const addressFormatted = encodeURIComponent(address);
    return `https://www.google.com/maps?q=${addressFormatted}`; // Fallback using the encoded address
  };

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/rental/getBranch/${id}`);
        if (!response.ok) {
          throw new Error('Failed to retrieve branch details.');
        }
        const data = await response.json();
        setBranch(data);
      } catch (error) {
        console.error('Error fetching branch details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranchDetails();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!branch) return <p>Branch information not available.</p>;

  return (
    <div>
      <Navbar hasBackground={true} /> {/* Navbar with background */}

      <div className="property-container">
        <div className="property-details">
          <div className="property-info">
            <h2 className="property-title">{branch.name}</h2>
            <p><strong>Address:</strong> {branch.address}</p>
            <p><strong>Contact:</strong> {branch.contact}</p>
            <p><strong>Operating Hours:</strong> {branch.hours}</p>
            <p>{branch.description}</p>
          </div>

          <button 
            className="availability-btn" 
            onClick={() => navigate(`/branch/${id}/rooms`)}
          >
            See Rooms Availability
          </button>

          {branch.image && (
            <div className="property-image-container">
              <img
                src={getImagePath(branch.image)}
                alt={branch.name}
                className="property-image"
              />
            </div>
          )}

          <div className="property-features-container">
            <h3 className="property-location-title">Amenities</h3>
            <div className="property-features">
              {branch.pricePerMonth && (
                <p className="property-price">
                  ₱{branch.pricePerMonth.toLocaleString()}
                  <span className="price-month"> /month</span>
                </p>
              )}
              {branch.totalRooms && <p><strong>Total Rooms:</strong> {branch.totalRooms}</p>}
              {branch.accommodationPerRoom && <p><strong>Accommodation:</strong> Can accommodate {branch.accommodationPerRoom} people per room</p>}
              {branch.bathrooms && <p><strong>Bathrooms:</strong> {branch.bathrooms}</p>}
              {branch.parkingLot && <p><strong>Parking Lot:</strong> {branch.parkingLot}</p>}
              {branch.Wifi && <p><strong>Wifi:</strong> {branch.Wifi}</p>}
              {branch.airConditioning && <p><strong>Air Conditioning:</strong> {branch.airConditioning}</p>}
              {branch.swimmingPool && <p><strong>Swimming Pool:</strong> {branch.swimmingPool}</p>}
              {branch.gym && <p><strong>Gym:</strong> {branch.gym}</p>}
              {branch.garden && <p><strong>Garden:</strong> {branch.garden}</p>}
              {branch.security && <p><strong>Security:</strong> {branch.security}</p>}
              {branch.elevator && <p><strong>Elevator:</strong> {branch.elevator}</p>}
            </div>
          </div>
        </div>

        <div className="property-location">
          <h3 className="property-location-title">Branch Location</h3>
          <iframe
            src={generateMapIframeSrc(branch.mapLink, branch.address)}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title={`${branch.name} Location`}
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      {/* Ratings and Reviews Section */}
      <section className="ratings-reviews-section">
        <RatingsAndReviews />
      </section> 

      <Footer /> {/* Footer outside the property container */}
    </div>
  );
};

export default PropertyPage;

