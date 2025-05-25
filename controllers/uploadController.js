const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const uploadToPinata = async (req, res) => {
  try {
    const filePath = req.file.path;

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const pinataRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxBodyLength: "Infinity",
      headers: {
        ...formData.getHeaders(),
        Authorization: process.env.PINATA_JWT,
      },
    });

    // Hapus file setelah diupload
    fs.unlinkSync(filePath);

    res.json({ ipfsHash: pinataRes.data.IpfsHash });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Failed to upload to Pinata" });
  }
};

module.exports = uploadToPinata;
