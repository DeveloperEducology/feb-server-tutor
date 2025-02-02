const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Profile = require("../models/Profile");

const auth = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email and password are required" });
  }

  try {
    let user = await User.findOne({ email, password });

    if (user) {
      const profile = user.profileId
        ? await Profile.findById(user.profileId)
            .populate("otherInfo.preferredLocations")
            .populate("otherInfo.preferredCategories")
            .populate("otherInfo.preferredSubjects")
            .populate("otherInfo.preferredClasses")
            .populate("otherInfo.city")
        : null;

      const accessToken = user.createAccessToken();
      const refreshToken = user.createRefreshToken();

      return res.status(StatusCodes.OK).json({
        message: "User logged in successfully",
        user,
        profile,
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }

    user = new User({ email, password });
    await user.save();

    const accessToken = user.createAccessToken();
    const refreshToken = user.createRefreshToken();

    return res.status(StatusCodes.CREATED).json({
      message: "User created successfully",
      user,
      profile: null,
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during authentication" });
  }
};

const register = async (req, res) => {
  const { role, email, password, phone, userName, city } = req.body;

  console.log("req.body", req.body);

  // Validate email and password
  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Email and password are required",
    });
  }

  // Validate the role
  if (!role || !["customer", "captain", "admin"].includes(role)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Valid role is required (customer, captain, or admin)",
    });
  }

  try {
    // Check if a user with the given email already exists
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create a new user
    const user = new User({
      role,
      email,
      password,
      phone,
      userName,
      city,
    });

    await user.save();

    console.log("New user created:", user);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Error in register API:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while registering the user",
      error: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Refresh token is required" });
  }

  try {
    const payload = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = user.createAccessToken();
    const newRefreshToken = user.createRefreshToken();

    return res.status(StatusCodes.OK).json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid refresh token" });
  }
};

const fetchUser = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid userId format" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Fetch user error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the user" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(StatusCodes.OK).json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching users" });
  }
};

module.exports = {
  refreshToken,
  auth,
  register,
  fetchUser,
  getUsers,
};
