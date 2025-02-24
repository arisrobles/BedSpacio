import React, { useState, useEffect, useRef } from 'react';
import { FaTrash } from 'react-icons/fa'; // Import trash icon
import '../../assets/styles/ManageBookings.css';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const deleteModalRef = useRef();

  const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000" // Development API
    : "https://your-production-backend.com"; // Production API

  // Handle clicks outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setShowDeleteModal(false);
        setBookingToDelete(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const storedUser = localStorage.getItem("user_profile");
        if (!storedUser) return; // If no user is found, do nothing
  
        const user = JSON.parse(storedUser);
        const userId = user.id; // Ensure this matches your backend's user ID field
  
        const response = await fetch(`${API_URL}/rental/getBookings/${userId}`);
        const data = await response.json();
  
        setBookings(data);
        setFilteredBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
  
    fetchBookings();
  }, []);  

  // Filter bookings based on search query
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = bookings.filter(
      (booking) =>
        booking.tenant.toLowerCase().includes(lowerCaseQuery) ||
        booking.property.toLowerCase().includes(lowerCaseQuery) ||
        booking.status.toLowerCase().includes(lowerCaseQuery) ||
        booking.date.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredBookings(filtered);
  }, [searchQuery, bookings]);

  const handleAction = async (id, action) => {
    try {
      const response = await fetch(`${API_URL}/rental/updateBookingStatus/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === id ? { ...booking, status: action } : booking
        )
      );
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleDelete = async (id) => {
    setBookingToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/rental/deleteBooking/${bookingToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }

      setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingToDelete));
      setFilteredBookings((prevFiltered) => prevFiltered.filter((booking) => booking.id !== bookingToDelete));
    } catch (error) {
      console.error('Error deleting booking:', error);
    } finally {
      setShowDeleteModal(false);
      setBookingToDelete(null);
    }
  };

  return (
    <div className="manage-bookings">
      <h1 className="header-title">Manage Bookings</h1>
      <div className="buttons-wrapper">
        <input
          type="text"
          placeholder="Search by tenant, property, or email..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bookings-list">
        {filteredBookings.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Actions</th> {/* Move delete icon to left side */}
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Property</th>
                <th>Booking Date</th>
                <th>Duration</th>
                <th>Group Size</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td className="delete-icon-cell">
                  {booking.status === 'Canceled' && ( // Only show delete if status is Canceled
                    <FaTrash
                      className="delete-icon"
                      onClick={() => handleDelete(booking.id)}
                      title="Delete Booking"
                    />
                  )}
                </td>
                <td>{booking.tenant}</td>
                <td>{booking.email}</td>
                <td>{booking.contact}</td>
                <td>{booking.property}</td>
                <td>{booking.date}</td>
                <td>{booking.rent_duration} months</td>
                <td>{booking.group_size}</td>
                <td>{booking.gender}</td>
                <td>
                  <span className={`status ${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="action-buttons">
                  {booking.status === 'Pending' && (
                    <>
                      <button
                        className="action-button approve"
                        onClick={() => handleAction(booking.id, 'Confirmed')}
                      >
                        Approve
                      </button>
                      <button
                        className="action-button reject"
                        onClick={() => handleAction(booking.id, 'Canceled')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'Confirmed' && (
                    <button
                      className="action-button cancel"
                      onClick={() => handleAction(booking.id, 'Canceled')}
                    >
                      Cancel
                    </button>
                  )}
                  {booking.status === 'Canceled' && <span>N/A</span>}
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        ) : (
          <div className="admin-no-bookings">No bookings to display.</div>
        )}
      </div>

      {showDeleteModal && (
        <div className="delete-confirmation-modal">
          <div className="delete-modal-content" ref={deleteModalRef}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this booking? This action cannot be undone.</p>
            <div className="delete-modal-actions">
              <button onClick={confirmDelete}>Yes, Delete</button>
              <button onClick={() => {
                setShowDeleteModal(false);
                setBookingToDelete(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
