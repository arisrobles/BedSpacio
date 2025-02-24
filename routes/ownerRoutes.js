const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');

// Login route
router.post('/login', ownerController.businessOwnerLogin);

router.get('/getBranches/:ownerId', ownerController.getBranches);

router.post('/addBranch', ownerController.addBranch);

// Route to delete a branch
router.delete('/deleteBranch/:id', ownerController.deleteBranch);

// New route to get a single branch by ID
router.get('/getBranch/:id', ownerController.getBranch);

router.post('/addBranch', ownerController.addBranch);

router.put('/updateBranch/:id', ownerController.updateBranch);

// Route to delete a branch
router.delete('/deleteBranch/:id', ownerController.deleteBranch);

// New route to get a single branch by ID
router.get('/getBranch/:id', ownerController.getBranch);

// New route to get a single branch by ID
router.get('/getBookings/:userId', ownerController.getBookings);

router.delete('/deleteBooking/:id', ownerController.deleteBooking);

router.put('/updateBookingStatus/:id', ownerController.updateBookingStatus);

// Define a new route to fetch rooms with branch names
router.get('/getRoomsWithBranch/:ownerId', ownerController.getRoomsWithBranch);

// Route for incrementing the renter count
router.put('/incrementRenter/:id', ownerController.incrementRenter);

// Route for decrementing the renter count
router.put('/decrementRenter/:id', ownerController.decrementRenter);

router.post('/addRoom', ownerController.addRoom);
router.put('/editRoom/:id', ownerController.editRoom);

// Add a new tenant
router.post('/addTenant', ownerController.addTenant);
// Update tenant details
router.put('/updateTenant/:id', ownerController.updateTenant);
// Delete a tenant
router.delete('/deleteTenant/:id', ownerController.deleteTenant);
// Get all tenants
router.get('/getTenants/:ownerId', ownerController.getTenants);

router.get('/getBranchesAndRooms/:ownerId', ownerController.getBranchesAndRooms);

router.put('/amenities/:branch_id', ownerController.updateAmenities);

router.post('/listProperty', ownerController.listProperty);

// Route for updating email credentials
router.put('/updateEmailCredentials/:id', ownerController.updateEmailCredentials);

// Settings routes
router.put('/updateProfile/:id', ownerController.updateProfile);
router.put('/updateBusinessInfo/:id', ownerController.updateBusinessInfo);

// Profile image upload route
router.put('/updateProfileImage/:id', ownerController.updateProfileImage);

// Add this new route
router.delete('/deleteProfileImage/:id', ownerController.deleteProfileImage);

module.exports = router;