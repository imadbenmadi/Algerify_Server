const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");
const RateController = require("../Controllers/RateController");
const CommentController = require("../Controllers/CommentController");
const IntresteController = require("../Controllers/IntresteController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dns = require("dns");
const { Users, Stores } = require("../models/Database");
const Verify_user = require("../Middleware/Verify_user");

router.get("/", UserController.getAllUsers); // Only Admin
router.get("/:userId/Profile", UserController.getProfile); // Only Admin
router.get("/:userId", UserController.getUser);
router.delete("/:userId", UserController.DeleteProfile);

async function validate_Edit_user_inputs(req, res, next) {
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    const userId = req.params.userId;
    if (!userId) {
        return res.status(409).json({ error: "Messing Data" });
    }
    if (req.params.userId !== isAuth.decoded.userId) {
        return res.status(401).json({ error: "Unauthorised" });
    }
    const userToUpdate = await Users.findById(userId);
    if (!userToUpdate) {
        return res.status(404).json({ error: "User not found." });
    }
    req.userToUpdate = userToUpdate;
    next();
}
async function validate_Create_Store_inputs(req, res, next) {
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    if (isAuth.status == false)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (req.params.userId !== isAuth.decoded.userId) {
        return res.status(401).json({ error: "Unauthorised" });
    }
    let { Email, StoreName, Store_Describtion, Telephone } = req.body;
    StoreName = StoreName.trim();
    if (!Email || !StoreName || !Store_Describtion || !Telephone) {
        return res.status(409).json({ error: "Messing Data" });
    }
    if (StoreName.length < 3 || Store_Describtion.length < 3) {
        return res.status(409).json({
            error: "StoreName and Store Description must be at least 3 characters long.",
        });
    } else if (Telephone.length < 9 || Telephone.length > 11) {
        return res.status(409).json({ error: "Invalid Telephone number" });
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(Email)) {
        return res.status(409).json({ error: "Invalid Email" });
    }
    const Store_Name_Exist = await Stores.findOne({ StoreName: StoreName });
    if (Store_Name_Exist) {
        return res.status(409).json({ error: "Store Name already exists." });
    }
    next();
}
const upload_Profile_Pic = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // Limiting file size to 5 MB
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const destinationPath = path.join(__dirname, "../../Public/Users");
            if (!fs.existsSync(destinationPath)) {
                fs.mkdirSync(destinationPath, { recursive: true });
            }
            cb(null, destinationPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix =
                Date.now() + "-" + Math.round(Math.random() * 1e9);
            const fileExtension = getFileExtension(file.originalname);
            if (!fileExtension) return cb(new Error("Invalid file type"));
            const generatedFilename = `${uniqueSuffix}${fileExtension}`;
            req.generatedFilename = generatedFilename;
            cb(null, generatedFilename);
        },
    }),
});
const upload_Store_Pic = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // Limiting file size to 5 MB
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const destinationPath = path.join(__dirname, "../../Public/Stores");
            if (!fs.existsSync(destinationPath)) {
                fs.mkdirSync(destinationPath, { recursive: true });
            }
            cb(null, destinationPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix =
                Date.now() + "-" + Math.round(Math.random() * 1e9);
            const fileExtension = getFileExtension(file.originalname);
            if (!fileExtension) return cb(new Error("Invalid file type"));
            const generatedFilename = `${uniqueSuffix}${fileExtension}`;
            req.generatedFilename = generatedFilename;
            cb(null, generatedFilename);
        },
    }),
});
function getFileExtension(filename) {
    const extension = path.extname(filename).toLowerCase();
    const imageExtensions = [".png", ".jpg", ".jpeg"];
    if (imageExtensions.includes(extension)) {
        return extension;
    } else {
        return false;
    }
}
router.put(
    "/:userId",
    (req, res, next) => validate_Edit_user_inputs(req, res, next),
    upload_Profile_Pic.single("image"),
    UserController.EditProfile
);

router.post(
    "/:userId/CreateStore",
    (req, res, next) => validate_Create_Store_inputs(req, res, next),
    upload_Store_Pic.single("image"),
    UserController.CreateStore
);
router.post("/:userId/Follow/:storeId", UserController.Follow_Store);
router.post("/:userId/Unfollow/:storeId", UserController.Unfollow_Store);
router.post("/:userId/Basket/:productId", UserController.add_to_Basket);
router.delete("/:userId/Basket/:productId", UserController.delete_from_Basket);
router.get("/:userId/Basket", UserController.get_Basket);

router.post("/:userId/Favorite/:productId", UserController.add_to_Favorit);
router.delete(
    "/:userId/Favorite/:productId",
    UserController.delete_from_Favorit
);
router.get("/:userId/Favorite", UserController.get_Favorite);
router.post("/:userId/RateProduct/:productId", RateController.RateProduct);
router.delete(
    "/:userId/RateProduct/:productId",
    RateController.Delete_RateProduct
);
router.put("/:userId/RateProduct/:productId", RateController.Edit_RateProduct);
router.get(
    "/:userId/RateProduct/:productId",
    RateController.get_product_userRate
);
router.post(
    "/:userId/CommentProduct/:productId",
    CommentController.CommentProduct
);
router.delete(
    "/:userId/CommentProduct/:productId",
    CommentController.Delete_CommentProduct
);

router.get(
    "/:userId/CommentProduct/:productId",
    CommentController.get_product_userComment
);
router.put(
    "/:userId/CommentProduct/:productId",
    CommentController.Etid_Comment
);
router.post("/:userId/RateStore/:storeId", RateController.RateStore);
router.delete("/:userId/RateStore/:storeId", RateController.Delete_RateStore);
router.put("/:userId/RateStore/:storeId", RateController.Edit_RateStore);
router.get("/:userId/RateStore/:storeId", RateController.get_Store_userRate);
router.post(
    "/:userId/Intrested/:productId",
    IntresteController.add_to_intrested_products
);
router.delete(
    "/:userId/Intrested/:productId",
    IntresteController.delete_from_intrested_products
);
router.post(
    "/:userId/Not_Intrested/:productId",
    IntresteController.add_to_not_intrested_products
);
router.delete(
    "/:userId/Not_Intrested/:productId",
    IntresteController.delete_from_not_intrested_products
);

router.post(
    "/:userId/Visit_Products/:productId",
    UserController.add_to_visited_products
);
router.post(
    "/:userId/Visit_Stores/:storeId",
    UserController.add_to_visited_stores
);
router.post("/:id/Calculate_Recommendation", UserController.Calculate_Recommendation);

module.exports = router;
