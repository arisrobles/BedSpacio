import React, { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaHome } from 'react-icons/fa';
import '../assets/styles/Searchbar.css';

const SearchBar = () => {
  const [searchData, setSearchData] = useState({
    location: '',
    type: '',
    price: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    // Implement search functionality
    console.log('Search data:', searchData);
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-group">
        <label className="input-label">
          <FaMapMarkerAlt className="input-icon" />
          Location
        </label>
        <input
          type="text"
          name="location"
          placeholder="Enter Your Destination"
          value={searchData.location}
          onChange={handleInputChange}
          className="search-input"
        />
      </div>

      <div className="search-input-group">
        <label className="input-label">
          <FaHome className="input-icon" />
          Type
        </label>
        <select
          name="type"
          value={searchData.type}
          onChange={handleInputChange}
          className="search-input"
        >
          <option value="">Select Type</option>
          <option value="studio">Studio</option>
          <option value="apartment">Apartment</option>
          <option value="condo">Condo</option>
          <option value="house">House</option>
          <option value="bedspace">Bedspace</option>
        </select>
      </div>

      <div className="search-input-group">
        <label className="input-label">
          <span className="input-icon">₱</span>
          Price Range
        </label>
        <select
          name="price"
          value={searchData.price}
          onChange={handleInputChange}
          className="search-input"
        >
          <option value="">Select Price Range</option>
          <option value="0-5000">₱0 - ₱5,000</option>
          <option value="5000-10000">₱5,000 - ₱10,000</option>
          <option value="10000-15000">₱10,000 - ₱15,000</option>
          <option value="15000+">₱15,000+</option>
        </select>
      </div>

      <button className="search-button" onClick={handleSearch}>
        <FaSearch />
      </button>
    </div>
  );
};

export default SearchBar;
