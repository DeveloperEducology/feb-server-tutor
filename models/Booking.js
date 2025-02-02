const mongoose = require("mongoose");


const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobId: {  
    type: String, 
    
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  tuitionType: { type: String, required: false },
    city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: false },
location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pincode",
    required: false,
  },
   course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: false,
    },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date when created
  },
subjects: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: false },
  ],
  studentGender: { type: String },
  tutorGender: { type: String },
  isActive: {
    type: Boolean,
    default: true,
  },
  tutorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // Store applied tutors

});

module.exports = mongoose.model("Booking", BookingSchema);
