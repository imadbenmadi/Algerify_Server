const router = require("express").Router();
const { getImage } = require("../Controllers/getImage");
const {
    profilePhotoUploadCntr,
    removePhotoCntr,
    updatePhotoCntr,
} = require("../Controllers/uploadPhotos");
const photoUpload = require("../Middleware/photoUpload");

router.post(
  "/photo-upload",
  photoUpload.single("image"),
  profilePhotoUploadCntr
);
router.put("/photo-upload", photoUpload.single("image"), updatePhotoCntr);
router.delete("/delate-image", removePhotoCntr);
router.get("/getImage", getImage);
module.exports = router;
