// models/Certificate.js
const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    ipfsHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Buat nyimpan createdAt dan updatedAt otomatis
  }
);

module.exports = mongoose.model("Certificate", certificateSchema);
