import React, { useState, useEffect, useRef } from 'react';
import { FaUserPlus } from 'react-icons/fa';
import '../../assets/styles/ManageTenants.css';

const ManageTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [newTenant, setNewTenant] = useState({
    id: '',
    name: '',
    room: '',
    branch: '',
    email: '',
    phone: '',
    moveInDate: '',
    status: 'active',
    moveOutDate: null,
  });
  const [branchesAndRooms, setBranchesAndRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoveOutModal, setShowMoveOutModal] = useState(false);
  const [tenantToMoveOut, setTenantToMoveOut] = useState(null);
  const [moveOutDate, setMoveOutDate] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Refs for modal content
  const modalRef = useRef();
  const deleteModalRef = useRef();
  const moveOutModalRef = useRef();

  const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000" // Development API
    : "https://your-production-backend.com"; // Production API

  // Handle clicks outside modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setShowDeleteModal(false);
        setTenantToDelete(null);
      }
      if (moveOutModalRef.current && !moveOutModalRef.current.contains(event.target)) {
        setShowMoveOutModal(false);
        setTenantToMoveOut(null);
        setMoveOutDate('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch tenants from backend
  useEffect(() => {
    fetchTenants();
  }, []);
  
  const fetchTenants = async () => {
    try {
      const storedUser = localStorage.getItem("user_profile");
      if (!storedUser) return; // If no user, do nothing
  
      const user = JSON.parse(storedUser);
      const ownerId = user.id; // Ensure this matches backend owner_id
  
      const response = await fetch(`${API_URL}/rental/getTenants/${ownerId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tenants");
      }
  
      const data = await response.json();
      setTenants(data);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  };  

  // Fetch branches and rooms
  useEffect(() => {
    const fetchBranchesAndRooms = async () => {
      try {
        const storedUser = localStorage.getItem("user_profile");
        if (!storedUser) return; // If no user, do nothing
  
        const user = JSON.parse(storedUser);
        const ownerId = user.id; // Ensure this matches backend owner_id
  
        const response = await fetch(`${API_URL}/rental/getBranchesAndRooms/${ownerId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch branches and rooms");
        }
  
        const data = await response.json();
        setBranchesAndRooms(data);
      } catch (error) {
        console.error("Error fetching branches and rooms:", error);
      }
    };
  
    fetchBranchesAndRooms();
  }, []);  

  // Filter rooms based on selected branch
  const handleBranchChange = (e) => {
    const branchName = e.target.value;
    setNewTenant((prev) => ({ ...prev, branch: branchName }));

    // Filter rooms based on branch selection
    const roomsForBranch = branchesAndRooms.find(
      (item) => item.branch_name === branchName
    );
    setFilteredRooms(roomsForBranch ? roomsForBranch.rooms : []);
  };

  // Search filter
  const filteredTenants = tenants.filter(
    (tenant) =>
      (tenant.name?.toLowerCase() || '').includes(searchQuery) ||
      (tenant.room?.toLowerCase() || '').includes(searchQuery) ||
      (tenant.branch?.toLowerCase() || '').includes(searchQuery) ||
      (tenant.email?.toLowerCase() || '').includes(searchQuery) ||
      (tenant.phone?.toLowerCase() || '').includes(searchQuery)
  );

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTenant((prev) => ({ ...prev, [name]: value }));
  };

  // Handle modal open and close
  const openModal = (tenant = null) => {
    if (tenant) {
      setNewTenant(tenant);
      setFilteredRooms(
        branchesAndRooms.find((item) => item.branch_name === tenant.branch)?.rooms || []
      );
    } else {
      setNewTenant({
        id: '',
        name: '',
        room: '',
        branch: '',
        email: '',
        phone: '',
        moveInDate: '',
        status: 'active',
        moveOutDate: null,
      });
      setFilteredRooms([]);
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // Add or Edit tenant
  const handleSaveTenant = async () => {
    try {
      if (newTenant.id) {
        // Update existing tenant
        const response = await fetch(`${API_URL}/rental/updateTenant/${newTenant.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTenant),
        });

        if (response.ok) {
          setMessage('Tenant updated successfully!');
          setMessageType('success');
          setTenants((prevTenants) =>
            prevTenants.map((tenant) => (tenant.id === newTenant.id ? newTenant : tenant))
          );
        } else {
          throw new Error('Failed to update tenant');
        }
      } else {
        // Add new tenant
        const storedUser = localStorage.getItem("user_profile");
        if (!storedUser) {
          setMessage('User not found. Please log in.');
          setMessageType('error');
          return;
        }
        const user = JSON.parse(storedUser);
        const ownerId = user.id;
        
        const response = await fetch(`${API_URL}/rental/addTenant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...newTenant, owner_id: ownerId }),
        });      

        if (response.ok) {
          setMessage('Tenant added successfully!');
          setMessageType('success');
          const result = await response.json();
          setTenants((prevTenants) => [...prevTenants, result]);
        } else {
          throw new Error('Failed to add tenant');
        }
      }
      closeModal();
    } catch (error) {
      console.error('Error saving tenant:', error);
      setMessage(error.message || 'Failed to save tenant. Please try again.');
      setMessageType('error');
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  // Update the delete handler
  const handleDeleteTenant = (id) => {
    setTenantToDelete(id);
    setShowDeleteModal(true);
  };

  // Add confirm delete handler
  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/rental/deleteTenant/${tenantToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Tenant deleted successfully!');
        setMessageType('success');
        setTenants((prevTenants) => prevTenants.filter((tenant) => tenant.id !== tenantToDelete));
      } else {
        throw new Error('Failed to delete tenant');
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      setMessage('Failed to delete tenant. Please try again.');
      setMessageType('error');
    } finally {
      setShowDeleteModal(false);
      setTenantToDelete(null);
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  // Add this function to handle move-out
  const handleMoveOut = (tenant) => {
    setTenantToMoveOut(tenant);
    setMoveOutDate('');
    setShowMoveOutModal(true);
  };

  // Add this function to confirm move-out
  const confirmMoveOut = async () => {
    try {
      const response = await fetch(`${API_URL}/rental/moveOutTenant/${tenantToMoveOut.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ moveOutDate }),
      });

      if (response.ok) {
        setMessage('Move-out processed successfully!');
        setMessageType('success');
        fetchTenants(); // Refresh the tenants list
      } else {
        throw new Error('Failed to process move-out');
      }
    } catch (error) {
      console.error('Error processing move-out:', error);
      setMessage('Failed to process move-out. Please try again.');
      setMessageType('error');
    } finally {
      setShowMoveOutModal(false);
      setTenantToMoveOut(null);
      setMoveOutDate('');
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  return (
    <div className="manage-tenants">
      {message && (
        <div className={`message-banner ${messageType}`}>
          {message}
        </div>
      )}
      <h1>Manage Tenants</h1>
      <p className="description">View and manage registered tenants here.</p>

      <div className="buttons-wrapper">
        <button className="add-tenant-btn" onClick={() => openModal()}>
          <FaUserPlus className="icon" />
          Add New Tenant
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search tenants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          className="search-input"
        />
      </div>

      {/* Tenants List */}
      <div className="tenants-list">
        {filteredTenants.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Room</th>
                <th>Branch</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Move-In Date</th>
                <th>Status</th>
                <th>Move-Out Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className={tenant.status === 'moved_out' ? 'moved-out' : ''}>
                  <td>{tenant.name}</td>
                  <td>{tenant.room}</td>
                  <td>{tenant.branch}</td>
                  <td>{tenant.email}</td>
                  <td>{tenant.phone}</td>
                  <td>{tenant.move_in_date}</td>
                  <td>{tenant.status === 'moved_out' ? 'Moved Out' : 'Active'}</td>
                  <td>{tenant.moveOutDate || '-'}</td>
                  <td className="tenant-actions">
                    {tenant.status !== 'moved_out' && (
                      <>
                        <button className="edit-btn" onClick={() => openModal(tenant)}>
                          Edit
                        </button>
                        <button className="move-out-btn" onClick={() => handleMoveOut(tenant)}>
                          Move Out
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteTenant(tenant.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No tenants to display.</div>
        )}
      </div>

      {/* Modal for Adding/Editing Tenant */}
      {showModal && (
        <div className="modal">
          <div className="modal-content" ref={modalRef}>
            <h2>{newTenant.id ? 'Edit Tenant' : 'Add New Tenant'}</h2>
            <form>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={newTenant.name}
                onChange={handleChange}
              />
              <label>Branch</label>
              <select
                name="branch"
                value={newTenant.branch}
                onChange={handleBranchChange}
              >
                <option value="">Select Branch</option>
                {branchesAndRooms.map((branch) => (
                  <option key={branch.branch_name} value={branch.branch_name}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
              <label>Room</label>
              <select
                name="room"
                value={newTenant.room}
                onChange={handleChange}
              >
                <option value="">Select Room</option>
                {filteredRooms.map((room) => (
                  <option key={room.room_id} value={room.room_number}>
                    {room.room_number} ({room.type})
                  </option>
                ))}
              </select>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={newTenant.email}
                onChange={handleChange}
              />
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={newTenant.phone}
                onChange={handleChange}
              />
              <label>Move-In Date</label>
              <input
                type="date"
                name="moveInDate"
                value={newTenant.moveInDate}
                onChange={handleChange}
              />
            </form>

            <div className="modal-buttons">
              <button onClick={closeModal}>Cancel</button>
              <button onClick={handleSaveTenant}>
                {newTenant.id ? 'Save Changes' : 'Add Tenant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-confirmation-modal">
          <div className="delete-modal-content" ref={deleteModalRef}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this tenant? This action cannot be undone.</p>
            <div className="delete-modal-actions">
              <button onClick={confirmDelete}>Yes, Delete</button>
              <button onClick={() => {
                setShowDeleteModal(false);
                setTenantToDelete(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Move-Out Modal */}
      {showMoveOutModal && (
        <div className="move-out-modal">
          <div className="move-out-modal-content" ref={moveOutModalRef}>
            <h2>Process Move-Out</h2>
            <p>Please enter the move-out date for {tenantToMoveOut?.name}</p>
            
            <div className="move-out-form">
              <label>Move-Out Date</label>
              <input
                type="date"
                value={moveOutDate}
                onChange={(e) => setMoveOutDate(e.target.value)}
                required
              />
            </div>

            <div className="move-out-modal-actions">
              <button onClick={confirmMoveOut}>Confirm Move-Out</button>
              <button onClick={() => {
                setShowMoveOutModal(false);
                setTenantToMoveOut(null);
                setMoveOutDate('');
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTenants;
