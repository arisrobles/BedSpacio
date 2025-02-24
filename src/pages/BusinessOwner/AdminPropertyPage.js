import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import '../../assets/styles/AdminPropertyPage.css';

const AdminPropertyPage = () => {
  const { id } = useParams();
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef();
  const [editedAmenities, setEditedAmenities] = useState({
    pricePerMonth: '',
    totalRooms: '',
    accommodationPerRoom: '',
    bathrooms: '',
    parkingLot: '',
    Wifi: '',
    airConditioning: '',
    swimmingPool: '',
    garden: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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
    if (mapLink) return mapLink;
    const addressFormatted = encodeURIComponent(address);
    return `https://www.google.com/maps?q=${addressFormatted}`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/rental/getBranch/${id}`);
        if (!response.ok) {
          throw new Error('Failed to retrieve branch details.');
        }
        const data = await response.json();
        setBranch(data);
        setEditedAmenities({
          pricePerMonth: data.pricePerMonth || '',
          totalRooms: data.totalRooms || '',
          accommodationPerRoom: data.accommodationPerRoom || '',
          bathrooms: data.bathrooms || '',
          parkingLot: data.parkingLot || '',
          Wifi: data.Wifi || '',
          airConditioning: data.airConditioning || '',
          swimmingPool: data.swimmingPool || '',
          gym: data.gym || '',
          garden: data.garden || '',
          security: data.security || '',
          elevator: data.elevator || '',
        });
      } catch (error) {
        console.error('Error fetching branch details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranchDetails();
  }, [id]);

  const handleModalClose = () => setIsModalOpen(false);
  const handleModalOpen = () => setIsModalOpen(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedAmenities((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/rental/amenities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedAmenities),
      });
      if (!response.ok) {
        throw new Error('Failed to update branch amenities.');
      }
      const updatedBranch = await response.json();
      setBranch(updatedBranch);
      handleModalClose();
      setMessage('Amenities updated successfully!');
      setMessageType('success');
      
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } catch (error) {
      console.error('Error updating branch amenities:', error);
      setMessage('Failed to update amenities. Please try again.');
      setMessageType('error');
      
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!branch) return <p>Branch information not available.</p>;

  return (
    <div>
      {message && (
        <div className={`message-banner ${messageType}`}>
          {message}
        </div>
      )}
      <div className="admin-property-container">
        <div className="admin-property-header">
          <h2 className="admin-property-title">{branch.name}</h2>
          <button onClick={handleModalOpen} className="admin-edit-btn">Edit Amenities</button>
        </div>

        <div className="admin-property-details">
          <div className="admin-property-info">
            <p><strong>Address:</strong> {branch.address}</p>
            <p><strong>Contact:</strong> {branch.contact}</p>
            <p><strong>Operating Hours:</strong> {branch.hours}</p>
            <p>{branch.description}</p>
          </div>

          {branch.image && (
            <div className="admin-property-image-container">
              <img
                src={getImagePath(branch.image)}
                alt={branch.name}
                className="admin-property-image"
              />
            </div>
          )}

          <div className="admin-property-features-container">
            <h3 className="admin-property-features-title">Amenities</h3>
            <div className="admin-property-features">
              {branch.pricePerMonth && (
                <p className="admin-property-price">
                  ₱{branch.pricePerMonth.toLocaleString()}
                  <span className="admin-price-month"> /month</span>
                </p>
              )}
              {branch.totalRooms && <p><strong>Total Rooms:</strong> {branch.totalRooms}</p>}
              {branch.accommodationPerRoom && <p><strong>Accommodation:</strong> {branch.accommodationPerRoom} people per room</p>}
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

        <div className="admin-property-location">
          <h3 className="admin-property-location-title">Branch Location</h3>
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

      {isModalOpen && (
        <div className="branch-modal">
          <div className="branch-modal-content" ref={modalRef}>
            <h2>Edit Amenities</h2>
            <form onSubmit={handleSubmit}>
              <label>Price per Month</label>
              <input
                type="number"
                name="pricePerMonth"
                value={editedAmenities.pricePerMonth}
                onChange={handleInputChange}
              />

              <label>Total Rooms</label>
              <input
                type="number"
                name="totalRooms"
                value={editedAmenities.totalRooms}
                onChange={handleInputChange}
              />

              <label>Accommodation per Room</label>
              <input
                type="text"
                name="accommodationPerRoom"
                value={editedAmenities.accommodationPerRoom}
                onChange={handleInputChange}
                placeholder="e.g., 2-3 people"
              />

              <label>Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={editedAmenities.bathrooms}
                onChange={handleInputChange}
              />

              <label>Parking Lot</label>
              <input
                type="text"
                name="parkingLot"
                value={editedAmenities.parkingLot}
                onChange={handleInputChange}
              />

              <label>Wifi</label>
              <input
                type="text"
                name="Wifi"
                value={editedAmenities.Wifi}
                onChange={handleInputChange}
              />

              <label>Air Conditioning</label>
              <input
                type="text"
                name="airConditioning"
                value={editedAmenities.airConditioning}
                onChange={handleInputChange}
              />

              <label>Swimming Pool</label>
              <input
                type="text"
                name="swimmingPool"
                value={editedAmenities.swimmingPool}
                onChange={handleInputChange}
              />

              <label>Garden</label>
              <input
                type="text"
                name="garden"
                value={editedAmenities.garden}
                onChange={handleInputChange}
              />

              <div className="branch-modal-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={handleModalClose}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertyPage;
