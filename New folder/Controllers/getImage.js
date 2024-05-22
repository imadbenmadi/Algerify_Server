// Require
const asyncHandler = require("express-async-handler");
const Image = require("../models/Image"); // Import the Image model

/**
 * @desc    getImage
 * @route   /api/getImage
 * @method POST
 * @access  public
 */

exports.getImage = asyncHandler(async (req, res) => {
  // Retrieve user ID and type from request body
  const { id, type } = req.body;

  // Query the database for image with specific element in array
  const image = await Image.find();

  // Handle no image found
  // if (!image) {
  //   return res.status(404).json({ message: "No image found" });
  // }

  // Respond with the image data or URL
  res.status(200).json(image);
});
