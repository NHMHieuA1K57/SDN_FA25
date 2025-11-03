const path = require("path");

// Stub implementations to allow server to boot.
// Replace with real Cloudinary integration as needed.

exports.uploadMediaToCloudinary = async function uploadMediaToCloudinary(filePath) {
  const fileName = path.basename(filePath || "file");
  return {
    public_id: `stub_${Date.now()}`,
    url: `https://example.com/uploads/${encodeURIComponent(fileName)}`,
  };
};

exports.deleteMediaFromCloudinary = async function deleteMediaFromCloudinary() {
  return true;
};

