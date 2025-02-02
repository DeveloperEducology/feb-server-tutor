const express = require("express");
const {
  createApplication,
  getAllApplications,
  getApplicationsByTutor,
  getApplicationsByJob,
  updateApplicationStatus,
} = require("../controllers/application.controller");

const router = express.Router();

router.post("/create", createApplication); // Apply for a job
router.get("/", getAllApplications); // Get all applications (Admin)
router.get("/tutor/:tutorId", getApplicationsByTutor); // Get tutor applications
router.get("/job/:jobId", getApplicationsByJob); // Get applications for a job
router.patch("/:applicationId", updateApplicationStatus); // Update application status

module.exports = router;
