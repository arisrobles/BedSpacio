import React, { useState, useEffect, useRef } from 'react';
import '../../assets/styles/ManageRooms.css';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({
    branch_id: '',
    room_number: '',
    type: '',
    price_per_night: '',
    max_occupancy: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const modalRef = useRef();

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://your-production-backend.com";

  useEffect(() => {
    fetchRooms();
    fetchBranches();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchRooms = async () => {
    try {
      const storedUser = localStorage.getItem("user_profile");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      const ownerId = user.id;

      const response = await fetch(`${API_URL}/rental/getRoomsWithBranch/${ownerId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }

      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const storedUser = localStorage.getItem("user_profile");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      const ownerId = user.id;

      const response = await fetch(`${API_URL}/rental/getBranches/${ownerId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch branches");
      }

      const data = await response.json();
      setBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const openModal = (room = null) => {
    if (room) {
      setCurrentRoom(room);
      setNewRoom({
        branch_id: room.branch_id,
        room_number: room.room_number,
        type: room.type,
        price_per_night: room.price_per_night,
        max_occupancy: room.max_occupancy,
      });
    } else {
      setCurrentRoom(null);
      setNewRoom({
        branch_id: '',
        room_number: '',
        type: '',
        price_per_night: '',
        max_occupancy: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRoom((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRoom = async () => {
    try {
      const storedUser = localStorage.getItem("user_profile");
      if (!storedUser) {
        setMessage("User not found. Please log in.");
        setMessageType("error");
        return;
      }

      const user = JSON.parse(storedUser);
      const owner_id = user.id;
      const newRoomWithOwner = { ...newRoom, owner_id };

      const response = await fetch(`${API_URL}/rental/addRoom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoomWithOwner),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Room added successfully!');
        setMessageType('success');
        fetchRooms();
        closeModal();
      } else {
        setMessage(result.message || 'Failed to add room');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error adding room:', error);
      setMessage('Failed to add room. Please try again.');
      setMessageType('error');
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const handleEditRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/rental/editRoom/${currentRoom.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom),
      });
      const result = await response.json();

      if (response.ok) {
        setMessage('Room updated successfully!');
        setMessageType('success');
        fetchRooms();
        closeModal();
      } else {
        setMessage(result.message || 'Failed to update room');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error editing room:', error);
      setMessage('Failed to update room. Please try again.');
      setMessageType('error');
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleIncrementRenter = async (roomId) => {
    try {
      const response = await fetch(`${API_URL}/rental/incrementRenter/${roomId}`, {
        method: 'PUT',
      });
      const result = await response.json();

      if (response.ok) {
        setMessage('Renter count increased successfully!');
        setMessageType('success');
        fetchRooms();
      } else {
        setMessage(result.message || 'Failed to increase renter count');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error incrementing renter:', error);
      setMessage('Failed to increase renter count. Please try again.');
      setMessageType('error');
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const handleDecrementRenter = async (roomId) => {
    try {
      const response = await fetch(`${API_URL}/rental/decrementRenter/${roomId}`, {
        method: 'PUT',
      });
      const result = await response.json();

      if (response.ok) {
        setMessage('Renter count decreased successfully!');
        setMessageType('success');
        fetchRooms();
      } else {
        setMessage(result.message || 'Failed to decrease renter count');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error decrementing renter:', error);
      setMessage('Failed to decrease renter count. Please try again.');
      setMessageType('error');
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const filteredRooms = rooms.filter((room) =>
    room.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.room_number.includes(searchTerm) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-rooms">
      {message && (
        <div className={`message-banner ${messageType}`}>
          {message}
        </div>
      )}
      <h1>Manage Rooms</h1>
      <p>View and manage room details here.</p>

      <div className="buttons-wrapper">
        <button className="add-room-btn" onClick={() => openModal()}>Add Room</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {filteredRooms.length === 0 && (
        <p className="no-rooms-message">No rooms available.</p>
      )}

      {filteredRooms.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Branch</th>
              <th>Room Number</th>
              <th>Type</th>
              <th>Price</th>
              <th>Max Occupancy</th>
              <th>Total Renters</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room.id}>
                <td>{room.branch_name}</td>
                <td>{room.room_number}</td>
                <td>{room.type}</td>
                <td>{room.price_per_night}</td>
                <td>{room.max_occupancy}</td>
                <td>
                  <div className="renter-actions">
                    <button 
                      className="minus-btn"
                      onClick={() => handleDecrementRenter(room.id)}
                      disabled={room.total_renters <= 0}
                    >
                      -
                    </button>
                    {room.total_renters}
                    <button 
                      className="plus-btn"
                      onClick={() => handleIncrementRenter(room.id)}
                      disabled={room.total_renters >= room.max_occupancy}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>
                  <button className="edit-btn" onClick={() => openModal(room)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content" ref={modalRef}>
            <h2>{currentRoom ? 'Edit Room' : 'Add Room'}</h2>
            <form>
              <label>Branch</label>
              <select
                name="branch_id"
                value={newRoom.branch_id}
                onChange={handleChange}
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>

              <label>Room Number</label>
              <input
                type="text"
                name="room_number"
                value={newRoom.room_number}
                onChange={handleChange}
              />

              <label>Type</label>
              <input
                type="text"
                name="type"
                value={newRoom.type}
                onChange={handleChange}
              />

              <label>Price per Night</label>
              <input
                type="number"
                name="price_per_night"
                value={newRoom.price_per_night}
                onChange={handleChange}
              />

              <label>Max Occupancy</label>
              <input
                type="number"
                name="max_occupancy"
                value={newRoom.max_occupancy}
                onChange={handleChange}
              />
            </form>

            <div className="modal-buttons">
              <button onClick={closeModal}>Cancel</button>
              <button onClick={currentRoom ? handleEditRoom : handleAddRoom}>
                {currentRoom ? 'Save Changes' : 'Add Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
