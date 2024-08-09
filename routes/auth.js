const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");
const {
  login,
  register,
  userData,
  deleteAccount,
  getUserById,
} = require("../controllers/auth");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chordlyrics_profile",
  },
});

const upload = multer({ storage: storage });
router.post("/login", login);
router.post("/register", upload.single("image"), register);
router.get("/userData", userData);
router.get("/getUser/:id", getUserById);
router.delete("/delete/:userId", deleteAccount);
router.put("/:id", upload.single("image"));

module.exports = router;
