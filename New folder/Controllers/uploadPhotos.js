const asyncHandler = require("express-async-handler");

const {
  uploadImageUploadImage,
  removeImageCloudinary,
} = require("../utils/cloudinary");

const Image = require("../models/Image");
/**
 * @desc     photo upload
 * @route   /api/photo-upload
 * @method POST
 * @access  private (only User logged in)
 */

module.exports.profilePhotoUploadCntr = asyncHandler(async (req, res) => {
  // console.log(req.file);
  // 1  check if file is uploaded
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  // get the path of the file
  // Get the path of the file
  const imagePath = req.file.path;

  // upload to cloudinary
  const resulte = await uploadImageUploadImage(
    imagePath,
    req.body.type,
    req.body.id
  );

  const image = new Image({
    user: req.body.id,
    image: resulte.secure_url,
    public_id: resulte.public_id,
    type: req.body.type,
  });

  await image.save();

  res
    .status(200)
    .json({ message: "Profile photo uploaded", url: resulte.secure_url });

  // remove the file from the server
  fs.unlinkSync(imagePath);
});

/**
 * @desc     remove photo from cloudinary
 * @route   /api/photo-upload
 * @method POST
 * @access  private (only User logged in)
 */

module.exports.removePhotoCntr = asyncHandler(async (req, res, next) => {
  try {
    // remove from cloudinary
    const result = await removeImageCloudinary(req.body.public_id);

    // If the removal from Cloudinary was successful, respond with success message
    res.status(200).json({ message: "Photo removed", result });
  } catch (error) {
    // If there's an error, pass it to the error handling middleware
    next(error);
  }
});

/**
 * @desc     update photo from cloudinary
 * @route   /api/photo-upload
 * @method POST
 * @access  private (only User logged in)
 */

module.exports.updatePhotoCntr = asyncHandler(async (req, res) => {
  try {
    // remove from cloudinary
    // await removeImageCloudinary(req.body.public_id);
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    // get the path of the file
    // Get the path of the file
    const imagePath = req.file.path;
    const resulte = await uploadImageUploadImage(
      imagePath,
      req.body.type,
      req.body.user
    );
    const image = await Image.findByIdAndUpdate(
      req.body.id,
      {
        $set: {
          image: resulte.url,
        },
      },
      { new: true }
    );

    // If the removal from Cloudinary was successful, respond with success message
    res.status(200).json({ message: "Photo updated", image });
  } catch (error) {
    // If there's an error, pass it to the error handling middleware
    res.status(400).json({ message: "Photo not  removed", error });
  }
});
