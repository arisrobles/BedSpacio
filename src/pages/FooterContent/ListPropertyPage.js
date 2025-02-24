import React, { useState } from 'react';
import '../../assets/styles/ListPropertyPage.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';

const ListPropertyPage = () => {
  const navigate = useNavigate();
  const API_URL = window.location.hostname === "localhost"
    ? "http://localhost:5000" // Development API
    : "https://your-production-backend.com"; // Production API

  const [formData, setFormData] = useState({
    // Owner Information
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    businessName: '',
    businessType: '',
    ownerAddress: '',
    validId: null,
    businessPermit: null,
    preferredContact: '',
    availableTime: '',
    
    // Existing Property Information
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    price: '',
    address: '',
    city: '',
    region: '',
    province: '',
    zipCode: '',
    description: '',
    amenities: [],
    images: []
  });

  const [error, setError] = useState('');

  const propertyTypes = [
    'Bedspace',
    'Apartment',
    'Condo',
    'House',
    'Studio Unit'
  ];

  const amenitiesOptions = [
    'Parking', 'Air Conditioning', 'Water Heater', 'Washing Machine',
    'Pet Friendly', 'Furnished', 'Security', 'CCTV',
    'Swimming Pool', 'Gym', 'Balcony', 'Storage',
    'Wifi Ready', '24/7 Security', 'Elevator', 'Generator'
  ];

  const businessTypes = [
    'Individual Owner',
    'Real Estate Agency',
    'Property Management Company',
    'Real Estate Developer',
    'Dormitory Owner',
    'Apartment Complex Owner'
  ];

  const contactPreferences = [
    'Phone Call',
    'SMS',
    'Email',
    'WhatsApp',
    'Viber'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenitiesChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: Array.isArray(prev.amenities)
        ? prev.amenities.includes(amenity)
          ? prev.amenities.filter(item => item !== amenity)
          : [...prev.amenities, amenity]
        : [amenity]  // Ensure it's always an array
    }));
  };  

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const formDataToSend = new FormData();
      
      // Append all text data
      Object.keys(formData).forEach(key => {
        if (key === 'amenities') {
          // Ensure amenities is sent as a proper JSON string
          formDataToSend.append('amenities', JSON.stringify(formData.amenities));
        } else if (key !== 'images' && key !== 'validId' && key !== 'businessPermit') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append files
      if (formData.validId) {
        formDataToSend.append('validId', formData.validId);
      }
      
      if (formData.businessPermit) {
        formDataToSend.append('businessPermit', formData.businessPermit);
      }
      
      // Append each image
      formData.images.forEach((image, index) => {
        formDataToSend.append(`images`, image);
      });

      console.log("Sending amenities:", JSON.stringify(formData.amenities));
      
      const response = await fetch(`${API_URL}/rental/listProperty`, {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (response.status === 201) {
        // Navigate to success page with property details
        navigate('/list-property/success', {
          state: {
            propertyId: data.propertyId,
            propertyType: formData.propertyType,
            address: formData.address
          }
        });
      }
    } catch (error) {
      console.error('Error listing property:', error);
      setError(error.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  return (
    <div className="list-property-page">
      <Navbar hasBackground={true} />
      <div className="list-property-container">
        <div className="list-property-header">
          <h1>List Your Property</h1>
          <p>Fill out the form below to list your property for rent</p>
          {error && <div className="error-message">{error}</div>}
        </div>

        <form className="list-property-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Owner Information</h2>
            
            <div className="form-group">
              <label htmlFor="ownerName">Full Name*</label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ownerEmail">Email Address*</label>
                <input
                  type="email"
                  id="ownerEmail"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ownerPhone">Contact Number*</label>
                <input
                  type="tel"
                  id="ownerPhone"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleInputChange}
                  required
                  placeholder="+63 XXX XXX XXXX"
                  pattern="[\+]?[0-9]{11,13}"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="businessName">Business/Company Name</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="If applicable"
                />
              </div>

              <div className="form-group">
                <label htmlFor="businessType">Business Type*</label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Business Type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type.toLowerCase()}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="ownerAddress">Business/Owner Address*</label>
              <input
                type="text"
                id="ownerAddress"
                name="ownerAddress"
                value={formData.ownerAddress}
                onChange={handleInputChange}
                required
                placeholder="Complete address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="validId">Valid Government ID*</label>
                <input
                  type="file"
                  id="validId"
                  name="validId"
                  onChange={(e) => handleFileChange(e, 'validId')}
                  accept="image/*,.pdf"
                  required
                  className="file-input"
                />
                <small>Upload a valid government ID (e.g., Driver's License, Passport, UMID)</small>
              </div>

              <div className="form-group">
                <label htmlFor="businessPermit">Business Permit</label>
                <input
                  type="file"
                  id="businessPermit"
                  name="businessPermit"
                  onChange={(e) => handleFileChange(e, 'businessPermit')}
                  accept="image/*,.pdf"
                  className="file-input"
                />
                <small>Required for business entities</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="preferredContact">Preferred Contact Method*</label>
                <select
                  id="preferredContact"
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Contact Preference</option>
                  {contactPreferences.map(method => (
                    <option key={method} value={method.toLowerCase()}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="availableTime">Best Time to Contact*</label>
                <input
                  type="text"
                  id="availableTime"
                  name="availableTime"
                  value={formData.availableTime}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Weekdays 9AM-5PM"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="propertyType">Property Type</label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Property Type</option>
                {propertyTypes.map(type => (
                  <option key={type} value={type.toLowerCase()}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bedrooms">Bedrooms</label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bathrooms">Bathrooms</label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Monthly Rent (₱)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="Enter amount in PHP"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Location</h2>
            <div className="form-group">
              <label htmlFor="address">Street Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="House/Unit No., Building, Street Name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City/Municipality</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="province">Province</label>
                <input
                  type="text"
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="region">Region</label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Region</option>
                  <option value="NCR">National Capital Region (NCR)</option>
                  <option value="CAR">Cordillera Administrative Region (CAR)</option>
                  <option value="Region1">Region I (Ilocos Region)</option>
                  <option value="Region2">Region II (Cagayan Valley)</option>
                  <option value="Region3">Region III (Central Luzon)</option>
                  <option value="Region4A">Region IV-A (CALABARZON)</option>
                  <option value="Region4B">Region IV-B (MIMAROPA)</option>
                  <option value="Region5">Region V (Bicol Region)</option>
                  <option value="Region6">Region VI (Western Visayas)</option>
                  <option value="Region7">Region VII (Central Visayas)</option>
                  <option value="Region8">Region VIII (Eastern Visayas)</option>
                  <option value="Region9">Region IX (Zamboanga Peninsula)</option>
                  <option value="Region10">Region X (Northern Mindanao)</option>
                  <option value="Region11">Region XI (Davao Region)</option>
                  <option value="Region12">Region XII (SOCCSKSARGEN)</option>
                  <option value="Region13">Region XIII (Caraga)</option>
                  <option value="BARMM">Bangsamoro (BARMM)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  maxLength="4"
                  pattern="[0-9]{4}"
                  placeholder="4-digit ZIP code"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Property Details</h2>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Amenities</label>
              <div className="amenities-grid">
                {amenitiesOptions.map(amenity => (
                  <label key={amenity} className="amenity-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenitiesChange(amenity)}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="images">Property Images</label>
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
              />
              <div className="image-preview">
                {formData.images.map((image, index) => (
                  <div key={index} className="preview-item">
                    {image.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              List Property
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ListPropertyPage; 