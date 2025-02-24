import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import '../../assets/styles/ManageProperties.css';

const AdminBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null); // For edit modal
  const [showModal, setShowModal] = useState(false); // For add/update modal
  const [showDeleteModal, setShowDeleteModal] = useState(false); // For delete confirmation
  const [branchToDelete, setBranchToDelete] = useState(null); // Store branch to delete
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();
  const modalRef = useRef();
  const deleteModalRef = useRef();

  const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000" // Development API
    : "https://your-production-backend.com"; // Production API

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setShowDeleteModal(false);
        setBranchToDelete(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const storedUser = localStorage.getItem("user_profile");
      if (!storedUser) return; // If no user, do nothing
  
      const user = JSON.parse(storedUser);
      const ownerId = user.id; // Ensure this matches backend owner_id
  
      const response = await fetch(`${API_URL}/rental/getBranches/${ownerId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch branches");
      }
      
      const data = await response.json();
      setBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch branches when the component mounts
  useEffect(() => {
    fetchBranches();
  }, []);  

  const getImagePath = (imageName) => {
    try {
      return require(`../../assets/images/branches/${imageName}`);
    } catch (error) {
      console.error(`Image not found: ${imageName}`);
      return null;
    }
  };

  const handleSeeProperty = (branchId) => {
    navigate(`/admin/property/${branchId}`);
  };

  const handleAddBranch = () => {
    setSelectedBranch(null); // Reset selected branch for adding a new one
    setShowModal(true);
  };

  const handleUpdateBranch = (branch) => {
    setSelectedBranch(branch); // Set the branch to edit
    setShowModal(true);
  };

  const handleRemoveBranch = async (branchId) => {
    setBranchToDelete(branchId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/rental/deleteBranch/${branchToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete branch');
      }
      
      setMessage('Branch successfully deleted!');
      setMessageType('success');
      fetchBranches();
    } catch (error) {
      console.error('Error deleting branch:', error);
      setMessage('Failed to delete branch. Please try again.');
      setMessageType('error');
    } finally {
      setShowDeleteModal(false);
      setBranchToDelete(null);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    }
  };

  const handleSaveBranch = async (branchData) => {
    const storedUser = localStorage.getItem("user_profile");
    if (!storedUser) {
      setMessage("User not found. Please log in.");
      setMessageType("error");
      return;
    }
  
    const user = JSON.parse(storedUser);
    const owner_id = user.id;
    const branchDataWithOwner = { ...branchData, owner_id };
  
    const url = selectedBranch
      ? `${API_URL}/rental/updateBranch/${selectedBranch.id}`
      : `${API_URL}/rental/addBranch`;
  
    const method = selectedBranch ? 'PUT' : 'POST';
  
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(branchDataWithOwner),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to ${selectedBranch ? 'update' : 'add'} branch`);
      }
  
      const result = await response.json();
      setMessage(`Branch successfully ${selectedBranch ? 'updated' : 'added'}!`);
      setMessageType('success');
      fetchBranches();
      setShowModal(false);
    } catch (error) {
      console.error(`Error ${selectedBranch ? 'updating' : 'adding'} branch:`, error);
      setMessage(`Failed to ${selectedBranch ? 'update' : 'add'} branch. Please try again.`);
      setMessageType('error');
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };  

  return (
    <div className="admin-branches-section">
      {message && (
        <div className={`message-banner ${messageType}`}>
          {message}
        </div>
      )}
      <div className="admin-section-header">
        <h1>Manage Branches</h1>
        <p className="admin-description">
          View, manage, and update all rental branches under your portfolio.
        </p>
      </div>

      <div className="admin-branches-content">
        {loading ? (
          <p className="admin-loading">Loading branches...</p>
        ) : branches.length > 0 ? (
          <ul className="admin-branches-list">
            {branches.map((branch) => (
              <li key={branch.id} className="admin-branch-item">
                <div
                  className="admin-branch-card"
                  onClick={() => handleSeeProperty(branch.id)}
                  role="button"
                >
                  <img
                    src={getImagePath(branch.image)}
                    alt={branch.name}
                    className="admin-branch-image"
                  />
                  <div className="admin-branch-info">
                    <h3 className="admin-branch-name">{branch.name}</h3>
                    <p><strong>Address:</strong> {branch.address}</p>
                    <p><strong>Contact:</strong> {branch.contact}</p>
                    <p><strong>Operating Hours:</strong> {branch.hours}</p>
                    <div className="admin-branch-actions">
                      <button
                        className="admin-update-branch-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleUpdateBranch(branch);
                        }}
                      >
                        Update
                      </button>
                      <button
                        className="admin-remove-branch-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleRemoveBranch(branch.id);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-no-branches">No branches found.</p>
        )}
        <div className="admin-add-branch-wrapper">
          <button
            className="admin-add-branch-btn"
            onClick={handleAddBranch}
          >
            <FaPlus />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="branch-modal" ref={modalRef}>
          <BranchModal
            branch={selectedBranch}
            onClose={() => setShowModal(false)}
            onSave={handleSaveBranch}
          />
        </div>
      )}

      {showDeleteModal && (
        <div className="delete-confirmation-modal">
          <div className="delete-modal-content" ref={deleteModalRef}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this branch? This action cannot be undone.</p>
            <div className="delete-modal-actions">
              <button onClick={confirmDelete}>Yes, Delete</button>
              <button onClick={() => {
                setShowDeleteModal(false);
                setBranchToDelete(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BranchModal = ({ branch, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: branch?.name || '',
    address: branch?.address || '',
    contact: branch?.contact || '',
    hours: branch?.hours || '',
    image: branch?.image || '',
    mapLink: branch?.mapLink || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="branch-modal-content">
      <h2>{branch ? 'Edit Branch' : 'Add New Branch'}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter branch name"
            required
          />
        </label>
        <label>
          Contact
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Enter contact details"
            required
          />
        </label>
        <label>
          Address
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter branch address"
            required
          />
        </label>
        <label>
          Operating Hours
          <input
            type="text"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            placeholder="Enter operating hours"
            required
          />
        </label>
        <label>
          Image URL
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Enter image URL"
            required
          />
        </label>
        <label>
          Map Link
          <input
            type="text"
            name="mapLink"
            value={formData.mapLink}
            onChange={handleChange}
            placeholder="Enter Google Maps link"
            required
          />
        </label>
        <div className="branch-modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit">
            {branch ? 'Update Branch' : 'Add Branch'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBranches;
