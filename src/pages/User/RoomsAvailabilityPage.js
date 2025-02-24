import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../assets/styles/RoomAvailabilityPage.css';

const RoomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [branchName, setBranchName] = useState('');
  const [loading, setLoading] = useState(true);

  const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000" // Development API
    : "https://your-production-backend.com"; // Production API

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        // Fetch branch details
        const branchResponse = await fetch(`${API_URL}/rental/getBranch/${id}`);
        if (!branchResponse.ok) {
          throw new Error('Failed to fetch branch details.');
        }
        const branchData = await branchResponse.json();
        setBranchName(branchData.name);

        // Fetch room details
        const roomsResponse = await fetch(`${API_URL}/rental/getRooms/${id}`);
        if (!roomsResponse.ok) {
          throw new Error('Failed to fetch room details.');
        }
        const roomsData = await roomsResponse.json();
        setRooms(roomsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranchDetails();
  }, [id]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <Navbar hasBackground={true} />
      <div className="room-details-page__container">
        <h1 className="room-details-page__title">Explore Available Rooms at {branchName || `Branch #${id}`}</h1>
        <div className="room-details-page__list">
          {rooms.map((room) => {
            const slotsLeft = room.max_occupancy - room.total_renters;
            const status =
              room.total_renters >= room.max_occupancy
                ? 'Full'
                : `Slots left: ${slotsLeft}`;

            return (
              <div className="room-details-page__card" key={room.id}>
                <div className="room-details-page__card-inner">
                  <img
                    src={
                      room.image
                        ? require(`../../assets/images/rooms/${room.image}`)
                        : require('../../assets/images/rooms/default-room.jpg')
                    }
                    alt={`Room ${room.room_number}`}
                    className="room-details-page__image"
                  />
                  <div className="room-details-page__info">
                    <h2 className="room-details-page__info-title">Room {room.room_number}</h2>
                    <h3 className="room-details-page__info-description">
                      {room.description || 'No description available'}
                    </h3>
                    <div className="room-details-page__info-details">
                      <p>
                        <strong>Beds:</strong> {room.type}
                      </p>
                      <p>
                        <strong>Price Per Month:</strong> ₱
                        {room.price_per_night.toLocaleString()}
                      </p>
                      <p>
                        <strong>Max Occupancy:</strong> {room.max_occupancy} guests
                      </p>
                      <p>
                        <strong>Status:</strong> {status}
                      </p>
                      <p>
    <strong>Owner ID:</strong> {room.owner_id}
  </p>
                    </div>
                    <button
                      className="room-details-page__rent-btn"
                      onClick={() =>
                        navigate(`/rent-room/${room.id}`, {
                          state: {
                            room,
                            branchName,
                            branchId: id,
                          },
                        })
                      }
                    >
                      Rent this Room
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RoomDetailsPage;
