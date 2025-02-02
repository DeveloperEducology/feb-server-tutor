const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true, // Ensures uniqueness
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking", // Reference to the job (Booking) schema
      required: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the Tutor (User) schema
      required: true,
    },
    tutorName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    description: {
      type: String,
      required: false,
    },
    expectedSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    appliedAt: {
      type: Date,
      default: Date.now, // Automatically set to the current timestamp
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Export the model
module.exports = mongoose.model("Application", applicationSchema);
