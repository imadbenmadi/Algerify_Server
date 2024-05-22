const { Users, Stores, Products } = require("../models/Database");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

require("dotenv").config();
const Verify_user = require("../Middleware/Verify_user");
const EditStore = async (req, res) => {
    try {
        const StoreToUpdate = req.StoreToUpdate;
        const { StoreName, Store_Describtion, Telephone } = req.body;
        if (StoreName) {
            StoreToUpdate.StoreName = StoreName;
        }
        if (Store_Describtion) {
            StoreToUpdate.Store_Describtion = Store_Describtion;
        }
        if (Telephone) {
            StoreToUpdate.Telephone = Telephone;
        }
        if (req.generatedFilename) {
            StoreToUpdate.Store_Image = req.generatedFilename;
        }
        await StoreToUpdate.save();
        return res.status(200).json({ message: "Store updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const EditProduct = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const productId = req.params.productId;

        const Store_in_db = req.Store_in_db;

        const ProductToUpdate = req.ProductToUpdate;

        const { Title, Describtion, Price } = req.body;
        // Update individual fields
        if (Title) {
            ProductToUpdate.Title = Title;
        }
        if (Describtion) {
            ProductToUpdate.Describtion = Describtion;
        }
        if (Price) {
            ProductToUpdate.Price = Price;
        }
        if (req.generatedFilename)
            ProductToUpdate.Product_Image = req.generatedFilename;
        await ProductToUpdate.save();
        return res
            .status(200)
            .json({ message: "Product updated successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
};
const getAllStores = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 20; // default to limit of 20 if not provided

    try {
        const totalCount = await Stores.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);
        const skip = (page - 1) * limit;
        const stores = await Stores.find()
            .select(
                "StoreName Store_Describtion Telephone Store_Image Store_RatingAverage"
            )
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ totalPages, stores });
    } catch (error) {
        return res.status(500).json({ error });
    }
};
const getStore = async (req, res) => {
    const StoreId = req.params.storeId;
    if (!StoreId) return res.status(409).json({ error: "Missing Data." });

    try {
        const Store_in_db = await Stores.findById(StoreId)
            .select(
                "StoreName Store_Describtion Telephone Store_RatingAverage Email Telephone storeProducts"
            )
            .populate({
                path: "storeProducts",
                populate: {
                    path: "Owner",
                    select: ["StoreName", "Store_Image"],
                },
            });
        if (!Store_in_db) {
            return res.status(404).json({ error: "Store not found." });
        }
        return res.status(200).json(Store_in_db);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
};
// Only admin
const getStore_Profile = async (req, res) => {
    const StoreId = req.params.storeId;
    if (!StoreId)
        return res.status(409).json({
            error: "Messing Data, required fields: StoreId: params",
        });
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
    try {
        const Store_in_db = await Stores.findById(StoreId)
            .populate({
                path: "Owner",
                select: [
                    "FirstName",
                    "LastName",
                    "Email",
                    "Telephone",
                    "ProfilePic",
                ],
            })
            .populate({
                path: "storeProducts",
                populate: {
                    path: "Owner",
                    select: ["StoreName", "Store_Image"],
                },
            });
        // 65fc6b66f649365e0b3b9268
        if (!Store_in_db) {
            return res.status(404).json({ error: "Store not found." });
        }
        console.log(Store_in_db.Owner._id, isAuth.decoded.userId);
        if (Store_in_db.Owner._id != isAuth.decoded.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        return res.status(200).json(Store_in_db);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const getStoreProducts = async (req, res) => {
    const storeId = req.params.storeId;
    if (!storeId) return res.status(409).json({ error: "Missing Data." });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    try {
        const store = await Stores.findById(storeId);
        if (!store) {
            return res.status(404).json({ error: "Store not found." });
        }

        const totalCount = await Products.countDocuments({ Owner: storeId });
        const totalPages = Math.ceil(totalCount / limit);
        const skip = (page - 1) * limit;

        const products = await Products.find({ Owner: storeId })
            .select(
                "Date Title Describtion Category Price Product_Image Product_RatingAverage Favorite_Counter Basket_Counter  bought_Counter Visits   "
            )
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ totalPages, products });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const DeleteStore = async (req, res) => {
    const isAdmin = await Verify_user(req, res);
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
    const StoreId = req.params.storeId;
    if (!StoreId)
        return res.status(409).json({
            error: "Messing Data, required fields: StoreId: params",
        });
    try {
        const Store_in_db = await Stores.findById(StoreId);
        if (!Store_in_db) {
            return res.status(404).json({ error: "Store not found." });
        }
        if (Store_in_db.Owner != isAdmin.decoded.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (Store_in_db.Store_Image) {
            const imagePath = path.join(
                __dirname,
                "../../Public/Stores",
                Store_in_db.Store_Image
            );
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Products.deleteMany({ Owner: StoreId });
        const user = await Users.findById(isAdmin.decoded.userId);
        if (user) {
            user.Stores = user.Stores.filter((store) => store._id != StoreId);
            await user.save();
        }
        await Stores.findByIdAndDelete(StoreId);

        return res
            .status(200)
            .json({ message: " Store deleted successfully." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
};
const DeleteProduct = async (req, res) => {
    const isAdmin = await Verify_user(req, res);
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
    try {
        const storeId = req.params.storeId;
        const productId = req.params.productId;
        if (!productId || !storeId) {
            return res.status(409).json({
                error: "Messing Data, required fields: productId: params, StoreId: params",
            });
        }

        const Store_in_db = await Stores.findById(storeId);
        if (!Store_in_db) {
            return res.status(404).json({ error: "Store not found." });
        }
        const ProductToDelete = await Products.findById(productId);
        if (!ProductToDelete) {
            return res.status(404).json({ error: "Product not found." });
        }
        if (Store_in_db.Owner.toString() != isAdmin.decoded.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (ProductToDelete.Owner.toString() != Store_in_db._id.toString()) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (ProductToDelete.Product_Image) {
            const imagePath = path.join(
                __dirname,
                "../../Public/Products",
                Store_in_db.Store_Image
            );
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        await Stores.findByIdAndUpdate(storeId, {
            $pull: { storeProducts: productId },
        });
        await Products.findByIdAndDelete(productId);
        return res
            .status(200)
            .json({ message: "Product deleted successfully." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
};

const CreateProduct = async (req, res) => {
    try {
        const { Title, Describtion, Category, Price } = req.body;
        const store_in_db = req.store_in_db;
        const newProduct = new Products({
            Owner: req.params.storeId,
            Title,
            Describtion,
            Category,
            Price,
            Product_Image: req.generatedFilename,
        });
        await newProduct.save();
        store_in_db.storeProducts.push(newProduct._id);
        await store_in_db.save();
        return res
            .status(200)
            .json({
                message: "Product Created successfully.",
                Product: newProduct,
            });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
};
const getStoreFollowers = async (req, res) => {
    const storeId = req.params.storeId;
    if (!storeId) return res.status(409).json({ error: "Missing Data." });

    try {
        const store = await Stores.findById(storeId);
        if (!store) {
            return res.status(404).json({ error: "Store not found." });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const totalCount = store.Followers.length;
        const totalPages = Math.ceil(totalCount / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, totalCount);

        const followerIds = store.Followers.slice(startIndex, endIndex);

        // Fetch user objects corresponding to followerIds
        const followers = await Users.find({
            _id: { $in: followerIds },
        }).select("FirstName LastName Email Gender ProfilePic");

        return res.status(200).json({ totalPages, followers });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
};

module.exports = {
    EditStore,
    EditProduct,
    getAllStores,
    getStoreProducts,
    getStore,
    getStore_Profile,
    DeleteProduct,
    DeleteStore,
    getStoreFollowers,
    CreateProduct,
};
