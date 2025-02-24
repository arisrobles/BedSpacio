import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import "../../assets/styles/RatingsReview.css";
import { FaFilter } from "react-icons/fa"; // FontAwesome filter icon

const RatingsAndReviews = () => {
  const { id: propertyId } = useParams(); // Access the 'id' parameter
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    name: "",
    rating: 0,
    comment: "",
  });
  const [filterRating, setFilterRating] = useState(0); // Default: show all reviews
  const [notification, setNotification] = useState({
    message: "",
    type: "", // success, error, etc.
    isVisible: false,
  });

  const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000" // Development API
    : "https://your-production-backend.com"; // Production API

  // Fetch reviews for the current property
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_URL}/rental/getReviews/${propertyId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [propertyId]);

  // Fetch user profile from localStorage
  useEffect(() => {
    const storedUserProfile = JSON.parse(localStorage.getItem("user_profile"));
    if (storedUserProfile) {
      setNewReview((prevData) => ({
        ...prevData,
        name: storedUserProfile.name || "",
      }));
    }
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
  
    // Ensure property_id is populated from the URL params
    const reviewData = {
      property_id: propertyId,  // Make sure this is populated correctly from useParams()
      ...newReview,
    };
  
    console.log('Submitting review:', reviewData); // Log to verify the data
  
    // Send review data to backend
    const response = await fetch("http://localhost:5000/rental/addReview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });
  
    if (response.ok) {
      const data = await response.json();
      setNotification({
        message: data.message || "Review submitted successfully!",
        type: "success",
        isVisible: true,
      });
      setNewReview({ name: "", rating: 0, comment: "" });
  
      // Fetch updated reviews after submission
      const reviewsResponse = await fetch(`http://localhost:5000/rental/getReviews/${propertyId}`);
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData);

      setTimeout(() => {
        setNotification((prev) => ({ ...prev, isVisible: false }));
      }, 3000); // Hide notification after 3 seconds
    } else {
      setNotification({
        message: "Error submitting review, please try again.",
        type: "error",
        isVisible: true,
      });

      setTimeout(() => {
        setNotification((prev) => ({ ...prev, isVisible: false }));
      }, 3000); // Hide notification after 3 seconds
    }
  };

  const calculateOverallRating = () => {
    if (reviews.length === 0) return 0; // Return 0 if there are no reviews
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRatings / reviews.length).toFixed(1);
  };

  const ratingBreakdown = () => {
    if (reviews.length === 0) return [0, 0, 0, 0, 0]; // Return empty breakdown if no reviews
    const breakdown = [0, 0, 0, 0, 0];
    reviews.forEach((review) => {
      breakdown[review.rating - 1]++;
    });
    return breakdown.reverse();
  };

  // Filter reviews based on selected rating
  const filteredReviews = filterRating
    ? reviews.filter((review) => review.rating === filterRating)
    : reviews;

  return (
    <section className="reviews-container">
      {/* Notification Overlay */}
      {notification.isVisible && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Overall Rating Section */}
      <div className="overall-rating">
        <h1>Our Reviews</h1>
        {reviews.length === 0 ? (
          <p>Be the first to review this property!</p>
        ) : (
          <p>Overall rating of {reviews.length} reviews</p>
        )}
        <div className="rating-summary">
          {reviews.length > 0 && (
            <div className="rating-number">
              <span>{calculateOverallRating()}</span>
              <div>
                <span className="stars">Out of 5 stars</span>
                {"★".repeat(5)}
              </div>
            </div>
          )}
          <div className="rating-bars">
            {ratingBreakdown().map((count, index) => (
              <div key={index} className="rating-bar">
                <span>{5 - index} Stars</span>
                <div className="bar">
                  <div
                    className="fill"
                    style={{ width: `${(count / reviews.length) * 100}%` }}
                  ></div>
                </div>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="rating-filter">
        <label>View Filters:</label>
        <div className="filter-dropdown">
          <FaFilter className="filter-icon" /> {/* Filter icon */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(Number(e.target.value))}
          >
            <option value={0}>All Ratings</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} ★
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {filteredReviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="rating">{"★".repeat(review.rating)}</div>
              <h3>{review.name}</h3>
              <div className="review-date">{review.date}</div>
            </div>
            <p className="review-comment">{review.comment}</p>
            {review.response && (
              <div className="response">
                <strong>Response: </strong>
                {review.response}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Review Form */}
      <div className="review-form-container">
        <h2>Leave Us Feedback</h2>
        <form className="review-form" onSubmit={handleReviewSubmit}>
          <select
            value={newReview.rating}
            onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
            required
          >
            <option value={0} disabled>
              Select Rating
            </option>
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} ★
              </option>
            ))}
          </select>
          <textarea
            placeholder="Your Feedback"
            value={newReview.comment}
            onChange={(e) =>
              setNewReview({ ...newReview, comment: e.target.value })
            }
            required
          ></textarea>
          <button type="submit">Submit Review</button>
        </form>
      </div>
    </section>
  );
};

export default RatingsAndReviews;
