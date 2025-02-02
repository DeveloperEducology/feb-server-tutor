const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");


const userSchema = new Schema(
  {
    profileImage: {
      type: String,
      default:
        "https://t3.ftcdn.net/jpg/03/64/62/36/360_F_364623623_ERzQYfO4HHHyawYkJ16tREsizLyvcaeg.jpg",
    },
    role: {
      type: String,
      enum: ["customer", "captain", "admin"],
      required: true,
    },
    userName: {
      type: String,
      // required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      // required: true,
      unique: true,
    },
    isNewUser: {
      type: Boolean,
      default: true,
    },
    isProfileVerified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
    city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
  },
  {
    timestamps: true, // Ensures createdAt and updatedAt fields are added automatically
  }
);



userSchema.methods.createAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      phone: this.phone,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    { id: this._id, phone: this.phone },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model("User", userSchema);
module.exports = User;
