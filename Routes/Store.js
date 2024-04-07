const express = require("express");
const router = express.Router();
const StoreController = require("../Controllers/StoreController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Stores, Users, Products } = require("../models/Database");
const Verify_Admin = require("../Middleware/Verify_Admin");
const Verify_User = require("../Middleware/Verify_User");

async function validate_Edit_Store_inputs(req, res, next) {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    const StoreId = req.params.storeId;
    if (!StoreId) {
        return res.status(409).json({ error: "Messing Data" });
    }
    const StoreToUpdate = await Stores.findById(StoreId);
    if (!StoreToUpdate) {
        return res.status(404).json({ error: "Store not found." });
    }
    if (StoreToUpdate.Owner != isAdmin.decoded.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    req.StoreToUpdate = StoreToUpdate;
    next();
}
async function validate_add_Product_inputs(req, res, next) {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        res.status(401).json({
            error: "Unauthorized: Invalid",
        });
    }
    const { Title, Describtion, Category, Price } = req.body;
    if (!Title || !Describtion || !Category || !Price) {
        return res.status(409).json({ error: "Messing Data" });
    }
    const store_in_db = await Stores.findById(req.params.storeId);
    if (!store_in_db) {
        return res.status(404).json({ error: "Store Not Found" });
    }
    req.store_in_db = store_in_db;
    if (store_in_db.Owner != isAdmin.decoded.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
}
async function validate_Edit_Product_inputs(req, res, next) {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    const storeId = req.params.storeId;
    const productId = req.params.productId;
    if (!productId || !storeId) {
        return res.status(409).json({ error: "Messing Data" });
    }
    const Store_in_db = await Stores.findById(storeId);
    if (!Store_in_db) {
        return res.status(404).json({ error: "Store not found." });
    }
    req.Store_in_db = Store_in_db;
    const ProductToUpdate = await Products.findById(productId);
    if (!ProductToUpdate) {
        return res.status(404).json({ error: "Product not found." });
    }
    req.ProductToUpdate = ProductToUpdate;
    if (Store_in_db.Owner.toString() != isAdmin.decoded.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (ProductToUpdate.Owner.toString() != Store_in_db._id.toString()) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
}
const upload_Store_Image = multer({
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
const upload_Product_Image = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // Limiting file size to 5 MB
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const destinationPath = path.join(
                __dirname,
                "../../Public/Products"
            );
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
    "/:storeId",
    (req, res, next) => validate_Edit_Store_inputs(req, res, next),
    upload_Store_Image.single("image"),
    StoreController.EditStore
);
router.put(
    "/:storeId/Products/:productId",
    (req, res, next) => validate_Edit_Product_inputs(req, res, next),
    upload_Product_Image.single("image"),
    StoreController.EditProduct
);
router.get("/", StoreController.getAllStores);
router.get("/:storeId/Profile", StoreController.getStore_Profile);
router.get("/:storeId", StoreController.getStore);
router.get("/:storeId/Products", StoreController.getStoreProducts);
router.delete("/:storeId", StoreController.DeleteStore);
router.delete("/:storeId/Products/:productId", StoreController.DeleteProduct);
router.post(
    "/:storeId/Products/Create",
    (req, res, next) => validate_add_Product_inputs(req, res, next),
    upload_Product_Image.single("image"),
    StoreController.CreateProduct
);
router.get("/:storeId/Followers", StoreController.getStoreFollowers);
module.exports = router;
