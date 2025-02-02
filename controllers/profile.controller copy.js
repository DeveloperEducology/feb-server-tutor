const Profile = require("../models/Profile");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.getCurrentProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "email"]
    );

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
    const { userId, basicInfo } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Convert string IDs to ObjectIds for references
    const formattedOtherInfo = {
      ...otherInfo,
      preferredCategories: otherInfo.preferredCategories.map((id) =>
        mongoose.Types.ObjectId(id)
      ),
      preferredClasses: otherInfo.preferredClasses.map((id) =>
        mongoose.Types.ObjectId(id)
      ),
      preferredSubjects: otherInfo.preferredSubjects.map((id) =>
        mongoose.Types.ObjectId(id)
      ),
      city: otherInfo.selectedCity
        ? mongoose.Types.ObjectId(otherInfo.selectedCity)
        : null,
    };

    // Create new profile
    const profile = new Profile({
      userId: mongoose.Types.ObjectId(userId),
      basicInfo: {
        firstName: basicInfo.firstName,
        lastName: basicInfo.lastName,
        gender: basicInfo.gender,
        whatsAppNumber: basicInfo.whatsAppNumber,
        dateOfBirth: basicInfo.dateOfBirth,
      },
    });

    await profile.save();

    // Populate references before sending response
    const populatedProfile = await Profile.findById(profile._id)
      .populate("otherInfo.preferredCategories")
      .populate("otherInfo.preferredClasses")
      .populate("otherInfo.preferredSubjects")
      .populate("otherInfo.city");

    res.status(201).json({
      message: "Profile created successfully",
      profile: populatedProfile,
    });
  } catch (error) {
    console.error("Profile creation error:", error);
    res.status(500).json({
      message: "Failed to create profile",
      error: error.message,
    });
  }
};

// Create and Save a new profile profile for the logged-in user
exports.createProfile1 = async (req, res) => {
  const {
    userId,
    userName,
    availability,
    otherInfo,
    experience,
    education,
    basicInfo,
    personalInformation,
    emergencyInformation,
    address,
  } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ status: false, message: "userId is required" });
  }

  try {
    // Debugging info
    console.log("req.files:", req.files);
    console.log("req.body before update:", req.body);

    // Handle file uploads
    let media = [];
    if (req.files && req.files.length > 0) {
      media = req.files.map((val) => {
        return {
          type: val.mimetype == "video/mp4" ? "video" : "image",
          url: val.location, // Assuming the file path is stored in `location`
        };
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const existingProfile = await ProfileModel.findOne({ userId });
    if (existingProfile) {
      return res
        .status(400)
        .json({ status: false, message: "User already has a profile" });
    }

    const newProfile = new ProfileModel({
      userId,
      userName,
      availability,
      otherInfo,
      experience,
      education,
      basicInfo,
      personalInformation,
      emergencyInformation,
      address,
      media,
      profileId: Date.now(),
    });

    const savedProfile = await newProfile.save();
    await UserModel.findByIdAndUpdate(userId, {
      isNewUser: false,
      // isProfileVerified: false,
    });

    res.send({
      data: savedProfile,
      message: "Profile created successfully",
      status: true,
    });
  } catch (error) {
    console.log("Error creating profile", error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
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
    const profiles = await Profile.find().populate("user", ["name", "email"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate(
      "user",
      ["name", "email"]
    );

    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    res.json(profile);
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
