// routes/certificateRoutes.js
const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate.js");

// GET /api/certificates?name=xxx
router.get("/", async (req, res) => {
  try {
    const { name } = req.query;
    let certificates;

    if (name) {
      certificates = await Certificate.find({ name: new RegExp(name, "i") });
    } else {
      certificates = await Certificate.find();
    }

    res.json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/certificates/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Certificate.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    res.json({ message: "Certificate deleted successfully" });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
