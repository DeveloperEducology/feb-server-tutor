const express = require("express");
const router = express.Router();
const auth = require("../middleware/authentication");
const  bookingcontroller  = require("../controllers/bookings");

router.post("/create-booking", auth, bookingcontroller.create);
router.get("/all", bookingcontroller.getAllBookings);
router.get("/allbooking", bookingcontroller.getBookings);

module.exports = router; // Corrected from `module. Exports` to `module.exports`

// https://192.168.29.247:3000/v3/search?q=chocolate&maxResults=5
