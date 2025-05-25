// routes/testPinata.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/ping", async (req, res) => {
  try {
    const response = await axios.get("https://api.pinata.cloud/data/testAuthentication", {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    });
    res.json({ success: true, message: "Connected to Pinata!", data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.response?.data || error.message });
  }
});

module.exports = router;
