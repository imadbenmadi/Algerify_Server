const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// cloudinary upload image
const uploadImageUploadImage = async (file, Type, id) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
      format: "jpg",
      public_id: `${Type}/${id}`,
    });
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Internal Server Error (cloudinary)");
  }
};

// remove image from cloudinary
const removeImageCloudinary = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Internal Server Error (cloudinary)");
  }
};

const cloudinaryRemoveMultipleImage = async (public_ids) => {
  try {
    const result = await cloudinary.api.delete_resources(public_ids);
    return result;
  } catch (error) {
    return error;
  }
};
module.exports = {
  uploadImageUploadImage,
  removeImageCloudinary,
  cloudinaryRemoveMultipleImage,
};
