const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Google Sign-In route
router.post('/auth/google', userController.googleSignIn);

router.get('/getBranches', userController.getBranches);

router.get('/getRooms/:id', userController.getRooms);

// New route to save renter details
router.post('/saveRenter', userController.saveRenter);

// Get reviews for a specific property (branch)
router.get('/getReviews/:propertyId', userController.getReviews);

// reviews.js (Routes file)
router.post('/addReview', userController.addReview);

module.exports = router;
