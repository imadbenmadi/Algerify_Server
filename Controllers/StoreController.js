const { Users, Stores, Products } = require("../models/Database");
require("dotenv").config();
const Verify_Admin = require("../Middleware/Verify_Admin");
const EditStore = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    try {
        const StoreId = req.params.storeId;
        if (!StoreId) {
            return res.status(409).json({ error: "Messing Data" });
        }
        const StoreToUpdate = await Stores.findById(StoreId);
        if (!StoreToUpdate) {
            return res.status(404).json({ error: "Store not found." });
        }
        if (StoreToUpdate.Owner != StoreId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
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
        await StoreToUpdate.save();
        return res.status(200).json({ message: "Store updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const EditProduct = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
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
            return res.status(409).json({ error: "Messing Data" });
        }

        const ProductToUpdate = await Products.findById(productId);
        if (!ProductToUpdate) {
            return res.status(404).json({ error: "Product not found." });
        }
        if (ProductToUpdate.Owner != storeId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
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
        await ProductToUpdate.save();
        return res
            .status(200)
            .json({ message: "Product updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const getAllStores = async (req, res) => {
    try {
        const allStores = await Stores.find().select(
            "StoreName Store_Describtion Telephone Store_Image Store_RatingAverage"
        );
        return res.status(200).json(allStores);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};

const getStore = async (req, res) => {
    const StoreId = req.params.storeId;
    if (!StoreId) return res.status(409).json({ error: "Messing Data." });
    const isAuth = await Verify_Admin(req, res);
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
        const Store_in_db = await Stores.findById(StoreId).populate({
            path: "products",
            select: "Title Describtion Price Product_RatingAverage",
        });
        if (!Store_in_db) {
            return res.status(404).json({ error: "Store not found." });
        }
        return res.status(200).json(Store_in_db);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const getStoreProducts = async (req, res) => {
    const StoreId = req.params.storeId;
    if (!StoreId) return res.status(409).json({ error: "Messing Data." });
    try {
        const Store_in_db = await Stores.findById(StoreId);
        if (!Store_in_db) {
            return res.status(404).json({ error: "Store not found." });
        }
        const Products_in_db = await Products.find({ Owner: StoreId }).select(
            "Title Describtion Price Product_RatingAverage"
        );
        return res.status(200).json(Products_in_db);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const DeleteStore = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    const StoreId = req.params.StoreId;
    if (!StoreId)
        return res.status(409).json({ error: "Store Id is required." });
    try {
        const Store_in_db = await Stores.findById(StoreId);
        if (!Store_in_db) {
            return res.status(404).json({ error: "Store not found." });
        }
        if (Store_in_db.Owner != StoreId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        await Products.deleteMany({ Owner: StoreId });
        await Stores.findByIdAndDelete(StoreId);
        return res.status(200).json(Store_in_db);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const DeleteProduct = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
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
        if (!productId) return res.status(409).json({ error: "Messing Data" });
        const Product_in_db = await Products.findById(productId);
        if (!Product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        if (Product_in_db.Owner != storeId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        await Products.findByIdAndDelete(productId);
        return res
            .status(200)
            .json({ message: "Product deleted successfully." });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};

// Only Admin can create a new Product
const CreateProduct = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    try {
        const { Title, Describtion, Category, Price } = req.body;
        if (!Title || !Describtion || !Category || !Price) {
            return res.status(409).json({ error: "Messing Data" });
        }
        const newProduct = new Products({
            Owner: req.params.storeId,
            Title,
            Describtion,
            Category,
            Price,
        });
        await newProduct.save();
        return res
            .status(200)
            .json({ message: "Product Created successfully." });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};

module.exports = {
    EditStore,
    EditProduct,
    getAllStores,
    getStoreProducts,
    getStore,
    DeleteProduct,
    DeleteStore,
    CreateProduct,
};
