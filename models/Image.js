const { string } = require("joi");
const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "User", // Assuming there's a User model that this ObjectId references
  },
  image: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
