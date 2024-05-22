const path = require("path");
const multer = require("multer");

// photo Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images"));
  },
  filename: function (req, file, cb) {
    if (file) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    } else {
      cb(null, null);
    }
  },
});

// photo upload middleware

const photoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  }, // 5MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb({ message: "Not an image! Please upload only images." }, false);
    }
  },
});

module.exports = photoUpload;