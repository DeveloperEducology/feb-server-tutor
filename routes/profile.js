const express = require('express');
const router = express.Router();
const auth = require('../middleware/authentication');
const profileController = require('../controllers/profile.controller');

// Get current user's profile
router.get('/me', auth, profileController.getCurrentProfile);

// Create or update profile
router.put('/update/:id',  profileController.update);

router.post('/create', profileController.createProfile);

// Get all profiles
router.get('/profiles', profileController.getAllProfiles);

// Get profile by user ID
router.get('/user/:userId', profileController.getProfileByUserId);

// Delete profile
router.delete('/', auth, profileController.deleteProfile);

module.exports = router;
    