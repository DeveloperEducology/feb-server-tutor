const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tuitionType: { type: String, required: false },
  city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: false },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pincode",
    required: false,
  },
  area: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: false,
  },
  subjects: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: false },
  ],
  studentGender: { type: String },
  tutorGender: { type: String },
  numStudents: { type: String },
  board: { type: String },
  days: [{ type: mongoose.Schema.Types.ObjectId, ref: "Day", required: false }],
  salary: { type: String, required: false },
  otherRequirement: { type: String },
  daysPerWeek: { type: String },
  tuitionDemoDate: {
    type: Date,
    required: false,
  },
  // New postedDate field
  postedDate: {
    type: Date,
    required: FileSystemWritableFileStream,
    default: Date.now, // Automatically set to the current date when created
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date when created
  },

  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Booking", BookingSchema);
