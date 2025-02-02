const express = require("express");
const router = express.Router();
const { refreshToken, auth, fetchUser, getUsers, register } = require("../controllers/auth");

router.post("/refresh-token", refreshToken);
router.post("/signin", auth);
router.post("/signup", register);
router.get("/fetchUser/:userId", fetchUser);
router.get("/getUsers", getUsers);

module.exports = router;
