const Profile = require("../models/Profile");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.getCurrentProfile = async (req, res) => {
  console.log(req.params.userId)
  try {
    const profile = await Profile.findOne(req.params.userId ).populate(
      "userId",
      ["userName", "email"]
    )
      .populate("otherInfo.preferredLocations")
      .populate("otherInfo.preferredCategories")
      .populate("otherInfo.preferredSubjects")
      .populate("otherInfo.preferredClasses")
      .populate("otherInfo.city")
      .populate("otherInfo.location")

    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Create and Save a new profile profile for the logged-in user
exports.createProfile = async (req, res) => {
  try {
    const { userId, basicInfo, personalInformation, otherInfo } = req.body;
    console.log(req.body)
    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Create new profile
    const profile = new Profile({
      userId: userId,
      basicInfo: {
        firstName: basicInfo.firstName,
        lastName: basicInfo.lastName,
        gender: basicInfo.gender,
        whatsAppNumber: basicInfo.whatsAppNumber,
        dateOfBirth: basicInfo.dateOfBirth,
      },
      personalInformation,
      otherInfo,
    });

    // console.log(profile);

    // Save the profile to the database
    await profile.save();

    // Update the user document with the profile ID
    await User.findByIdAndUpdate(
      userId, // Find the user by ID
      {
        $set: {
          isNewUser: false, // Mark the user as not new
          profileId: profile._id, // Associate the profile ID
          // city: otherInfo.city._id, // Associate the city ID
        },
      },
      { new: true } // Return the updated user document
    );

    res.status(201).json({
      message: "Profile created successfully",
      profile: profile,
      status: true,
    });
    console.log("Profile created successfully", profile);
  } catch (error) {
    console.error("Profile creation error:", error);
    res.status(500).json({
      message: "Failed to create profile",
      error: error.message,
      status: false,
    });
  }
};


exports.update = async (req, res) => {
  const { id } = req.params;
  console.log("id", id)
  console.log(req.body)
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update cannot be empty!",
    });
  }

  try {

    const updatedProfile = await Profile.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedProfile) {
      return res.status(404).send({
        message: `Cannot update profile with id=${id}. Maybe profile was not found!`,
      });
    }
    res.status(201).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
      status: "success",
    });
    res.status(201).send(updatedProfile);
  } catch (err) {
    res.status(500).send({
      message: "Error updating profile with id=" + id,
    });
  }
};


exports.createUpdateProfile = async (req, res) => {
  try {
    const { bio, location, website, skills, social } = req.body;

    // Build profile object
    const profileFields = {
      user: req.user.id,
      bio,
      location,
      website,
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill) => skill.trim()),
      social,
    };

    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    // Create
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find()
      .populate("otherInfo.preferredCategories")
      .populate("otherInfo.preferredSubjects")
      .populate("otherInfo.preferredClasses")
      .populate("otherInfo.preferredPincodes")
      .populate("otherInfo.city")
      // .populate("otherInfo.pincode")
      .exec();
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId })

      .populate("otherInfo.preferredLocations")
      .populate("otherInfo.preferredCategories")
      .populate("otherInfo.preferredSubjects")
      .populate("otherInfo.preferredClasses")
      .populate("otherInfo.city")
    console.log(req.params.userId)

    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    res.json(profile);
    console.log(profile)
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
