import React, { useState } from 'react';
import { 
  FaEnvelope, 
  FaPhone, 
  FaClock, 
  FaHeadset,
  FaPaperPlane 
} from 'react-icons/fa';
import TopNav from '../../components/BusinessOwner/TopNav';
import '../../assets/styles/AdminContact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;  // Destructure for clarity
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className="admin-contact">
      <TopNav />
      <header className="contact-header">
        <h1>Support Center</h1>
        <p>Get assistance from our dedicated support team</p>
      </header>

      <div className="contact-container">
        <div className="contact-info">
          <h2>Contact Information</h2>
          <div className="info-item">
            <div className="info-icon">
              <FaHeadset />
            </div>
            <h3>Customer Support</h3>
            <p><FaEnvelope /> support@bedspacio.com</p>
            <p><FaPhone /> +63 123 456 7890</p>
          </div>
          <div className="info-item">
            <div className="info-icon">
              <FaClock />
            </div>
            <h3>Business Hours</h3>
            <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
            <p>Saturday: 9:00 AM - 1:00 PM</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send Message</h2>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button type="submit" className="submit-btn">
            <FaPaperPlane /> Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact; 