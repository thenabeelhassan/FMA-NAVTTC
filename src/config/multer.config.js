const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const uploadPath = process.env.UPLOAD_DIR;

// Ensure the main upload directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Use memory storage so we can process files before saving
const storage = multer.memoryStorage();

const upload = multer({
  storage
});

module.exports = upload;
