const Application = require("../models/Application");
const mongoose = require("mongoose");
const Job = require("../models/Booking");

/**
 * @desc Create a new application
 * @route POST /api/applications
 * @access Public (or Authenticated Tutors)
 */
exports.createApplication = async (req, res) => {
    try {
      const { jobId, tutorId, tutorName, description, expectedSalary, applicationId } = req.body;
  
      // Check if the tutor already applied
      const existingApplication = await Application.findOne({ jobId, tutorId });
      if (existingApplication) {
        return res.status(400).json({ message: "You have already applied for this job." });
      }
  
      // Create a new application
      const application = new Application({
        jobId,
        tutorId,
        tutorName,
        description,
        expectedSalary,
        applicationId,
        // status: "pending",
      });
  
      // Save the application
      await application.save();
  
      // Update the Job document to add the tutorId to tutorIds array
      await Job.findByIdAndUpdate(jobId, { $addToSet: { tutorIds: tutorId } });
  
      res.status(201).json({ message: "Application submitted successfully", application });
    } catch (error) {
      res.status(500).json({ message: "Error saving application", error: error.message });
    }
  };
  
/**
 * @desc Get all applications
 * @route GET /api/applications
 * @access Admin Only
 */

exports.getJobDetails = async (req, res) => {
    try {
      const { jobId } = req.params;
  
      // Fetch the job with the applied tutors (populate tutorIds)
      const job = await Job.findById(jobId).populate("tutorIds", "userName email");
  
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
  
      res.status(200).json({ job });
    } catch (error) {
      res.status(500).json({ message: "Error fetching job details", error: error.message });
    }
  };
  

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("jobId", "title") // Fetch job title
      .populate("tutorId", "userName email"); // Fetch tutor details

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get applications for a specific tutor
 * @route GET /api/applications/tutor/:tutorId
 * @access Authenticated Tutor
 */
exports.getApplicationsByTutor = async (req, res) => {
  try {
    const { tutorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tutorId)) {
      return res.status(400).json({ message: "Invalid tutorId" });
    }

    const applications = await Application.find({ tutorId })
      .populate("jobId", "title description") // Fetch job details
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get applications for a specific job
 * @route GET /api/applications/job/:jobId
 * @access Admin or Job Poster
 */
exports.getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid jobId" });
    }

    const applications = await Application.find({ jobId })
      .populate("tutorId", "userName email") // Fetch tutor details
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Update application status (Accept/Reject)
 * @route PATCH /api/applications/:applicationId
 * @access Admin or Job Poster
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, responseMessage } = req.body;

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedApplication = await Application.findOneAndUpdate(
      { applicationId },
      { status, responseMessage, responseDate: new Date() },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ message: "Application status updated", application: updatedApplication });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
