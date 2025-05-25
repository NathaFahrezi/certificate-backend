const express = require("express");
const multer = require("multer");
const path = require("path");
const uploadToPinata = require("../controllers/uploadController");

const router = express.Router();

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), uploadToPinata);

module.exports = router;
