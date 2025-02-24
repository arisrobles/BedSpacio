// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/User/LandingPage'; // Page component import
import LoginPage from './pages/Auth/LoginPage';  // SignIn component import
import RegisterPage from './pages/Auth/RegisterPage';  // Register component import
import PropertyPage from './pages/User/PropertyPage';  // Your PropertyPage component
import RoomsAvailabilityPage from './pages/User/RoomsAvailabilityPage';
import RentRoomPage from './pages/User/RentRoomPage';
import ConfirmationPage from './pages/User/ConfirmationPage';
import ListPropertyPage from './pages/FooterContent/ListPropertyPage';
import ListPropertySuccessPage from './pages/FooterContent/ListPropertySuccessPage';

import AdminDashboard from './pages/BusinessOwner/AdminDashboard';
import AdminOverview from './pages/BusinessOwner/AdminOverview';
import ManageProperties from './pages/BusinessOwner/ManageProperties';
import ManageBookings from './pages/BusinessOwner/ManageBookings';
import ManageRooms from './pages/BusinessOwner/ManageRooms';
import ManageTenants from './pages/BusinessOwner/ManageTenants';
import ReportsPage from './pages/BusinessOwner/ReportsPage';
import AdminPropertyPage from './pages/BusinessOwner/AdminPropertyPage';
import Settings from './pages/BusinessOwner/Settings';
import Home from './pages/BusinessOwner/Home';
import About from './pages/BusinessOwner/About';
import Contact from './pages/BusinessOwner/Contact';

const BedSpacio = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/property/:id" element={<PropertyPage />} />
        <Route path="/branch/:id" element={<PropertyPage />} />
        <Route path="/branch/:id/rooms" element={<RoomsAvailabilityPage />} />
        <Route path="/rent-room/:roomId" element={<RentRoomPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/list-property" element={<ListPropertyPage />} />
        <Route path="/list-property/success" element={<ListPropertySuccessPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="overview" element={<AdminOverview />} />
          <Route path="home" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="properties" element={<ManageProperties />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="rooms" element={<ManageRooms />} />
          <Route path="tenants" element={<ManageTenants />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="/admin/property/:id" element={<AdminPropertyPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default BedSpacio;
