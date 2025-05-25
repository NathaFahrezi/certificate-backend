const express = require("express");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
require("dotenv").config();

console.log("MONGODB_URI:", process.env.MONGODB_URI); // Debug line

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


// ✅ Certificate model
const Certificate = require("./models/Certificate");

// ✅ Upload to Pinata
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileStream = fs.createReadStream(file.path);
    const formData = new FormData();
    formData.append("file", fileStream, file.originalname);

    const pinataRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
      }
    );

    fs.unlinkSync(file.path); // Hapus file lokal
    res.json({ ipfsHash: pinataRes.data.IpfsHash });
  } catch (error) {
    console.error("Upload error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// ✅ Save certificate
app.post("/api/certificates", async (req, res) => {
  const { name, department, ipfsHash } = req.body;

  try {
    if (!name || !department || !ipfsHash) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newCert = new Certificate({ name, department, ipfsHash });
    await newCert.save();

    // Catat data ke log atau simpan ke DB kalau diperlukan
console.log("Received certificate data:", { name, department, ipfsHash });

// Karena transaksi ke blockchain dilakukan di frontend, kita hanya konfirmasi terima data
res.status(200).json({ message: "Data received, blockchain handled in frontend." });

  } catch (error) {
    console.error("Save certificate error:", error.message);
    res.status(500).json({ error: "Failed to save certificate" });
  }
});

// ✅ Get all certificates
app.get("/api/certificates", async (req, res) => {
  try {
    const certs = await Certificate.find().sort({ createdAt: -1 });
    res.status(200).json(certs);
  } catch (error) {
    res.status(500).json({ error: "Failed to get certificates" });
  }
});

// ✅ Search certificate by name
app.get("/api/certificates/search", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: "Name query required" });
    }

    const results = await Certificate.find({
      name: { $regex: new RegExp(name, "i") },
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});

// ✅ Delete certificate by ID
app.delete("/api/certificates/:id", async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndDelete(req.params.id);
    if (!cert) return res.status(404).json({ error: "Certificate not found" });

    res.status(200).json({ message: "Certificate deleted" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ✅ Run server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
